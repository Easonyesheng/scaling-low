"""Bounded, read-only retrieval from public publisher RSS/Atom feeds."""
import concurrent.futures
import datetime as dt
from email.utils import parsedate_to_datetime
from html import unescape
import re
import urllib.request
import xml.etree.ElementTree as ET

FEEDS=(
    ('OpenAI', 'https://openai.com/news/rss.xml'),
    ('Google DeepMind', 'https://deepmind.google/blog/rss.xml'),
    ('NIST', 'https://www.nist.gov/news-events/news/rss.xml'),
    ('arXiv cs.AI', 'https://rss.arxiv.org/rss/cs.AI'),
    ('arXiv cs.CL', 'https://rss.arxiv.org/rss/cs.CL'),
)
RISK = re.compile(r'\b(?:artificial intelligence|ai|machine learning|model|llm|agent|data cent(?:er|re))s?\b',re.I)
TOPIC = re.compile(r'\b(?:reliab\w*|calibrat\w*|robust\w*|risk\w*|safet\w*|audit\w*|evaluat\w*|oversight|govern\w*|assurance|electricity|energy|infrastruct\w*|mitigat\w*|monitor\w*|failure\w*)\b',re.I)
BLOCK = re.compile(r'\b(?:exploit\w*|weapon\w*|bioweapon\w*|ransomware|malware|jailbreak\w*|phishing|lawsuit|alleg\w*|suicid\w*|stock price)\b',re.I)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None

def clean(s):
    return ' '.join(unescape(re.sub(r'<[^>]{0,900}>',' ',s or '')).split())

def name(tag):
    return tag.rsplit('}',1)[-1].lower()

def day(text):
    try:
        return dt.date.fromisoformat(text[:10])
    except ValueError:
        try: return parsedate_to_datetime(text).date()
        except (ValueError,TypeError,OverflowError): return None

def parse(xml,label,today,canon):
    if re.search(br'<!\s*(?:doctype|entity)',xml,re.I):
        raise ValueError('unsafe_feed_format')
    tree=ET.fromstring(xml)
    if name(tree.tag) not in {'rss','feed','rdf'}:
        raise ValueError('not_a_feed')
    rows=[]
    for el in tree.iter():
        if name(el.tag) not in ('item','entry'):
            continue
        title=''; facts=''; link=''; dates=[]
        for field in el:
            key=name(field.tag); value=''.join(field.itertext()).strip()
            if key=='title': title=clean(value)
            if key in ('summary','description','content','encoded') and not facts: facts=clean(value)
            if key=='link' and field.get('rel','alternate')=='alternate': link=field.get('href') or value
            if key in ('pubdate','published','date','issued','updated'): dates.append((key,day(value)))
        published=next((v for k,v in dates if k!='updated' and v),None)
        if not published or not 0<=(today-published).days<=4 or not title:
            continue
        if link.startswith('http://arxiv.org/'):
            link='https://'+link.removeprefix('http://')
        clean_url=canon(link)
        snippet=title+' '+facts
        if clean_url and RISK.search(snippet) and TOPIC.search(snippet) and not BLOCK.search(snippet):
            rows.append({'source':label,'url':clean_url,'date':published.isoformat(),
                         'title':title[:240],'excerpt':facts[:760]})
    return rows

def collect(today,canon,feeds=FEEDS):
    def get(item):
        label,url=item
        req=urllib.request.Request(url,headers={'Accept':'application/rss+xml, application/atom+xml, text/xml, application/xml',
                                                 'Accept-Encoding':'identity','User-Agent':'ScalingLowFeedReader/1.0'})
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
        try:
            with opener.open(req,timeout=10) as res:
                data=res.read(2_000_001)
            if len(data)>2_000_000: return False,[]
            return True,parse(data,label,today,canon)
        except (OSError,ValueError,ET.ParseError): return False,[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(feeds)) as pool:
        results=list(pool.map(get,feeds))
    unique={}
    for ok,items in results:
        for a in items:
            unique.setdefault(a['url'],a)
    return sum(ok for ok,_ in results),list(unique.values())

def select(query,rows):
    keys={x for x in re.findall(r'[a-z][a-z0-9-]{3,}',query.lower())
          if x not in {'find','recent','news','latest','from','with','about','published','risk'}}
    def score(item):
        words=set(re.findall(r'[a-z][a-z0-9-]{3,}',(item['title']+' '+item['excerpt']).lower()))
        return (len(words&keys),item['date'],item['url'])
    return sorted(rows,key=score,reverse=True)[:10]
