"""Reject unsupported, sensitive, or unverifiable drafts before public transfer."""
from html.parser import HTMLParser
import datetime as dt
import html
import re
import ssl
import unicodedata
import urllib.request
from urllib.parse import urlsplit

STOP={'about','after','also','been','before','could','from','have','into','more','over','said','says','that','their','they','this','those','through','under','using','were','when','which','will','with','would','study','paper','research','report','proposes','describes','published','introduces'}
BLOCK=re.compile(r'\b(?:lawsuit|fraud|accused|allegation|sued|criminal|malware|exploit|weapon|bioweapon|assassinat\w*|suicid\w*|bomb\w*|ransomware|phishing|jailbreak|stock price|share price)\b|起诉|索赔|指控|诈骗|勒索|越狱|漏洞利用|武器|爆炸|自杀|股价|做空',re.I)
PUB=re.compile(r'article:published_time|datepublished|publishdate|date\.published|dc\.date(?:\.issued)?|citation_date|originalpublicationdate|parsely-pub-date|article\.published',re.I)

def normalized(s):
    return ' '.join(unicodedata.normalize('NFKC',html.unescape(s)).casefold().split())

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip=0
        self.title=False
        self.data=[]
        self.headlines=[]
        self.dates=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','style','noscript','svg'):
            self.skip+=1
        if tag in ('title','h1'):
            self.title=True
        if tag=='meta' and PUB.search(' '.join(a.get(k) or '' for k in ('property','name','itemprop'))):
            self.dates.append(a.get('content') or '')
        if tag=='time' and a.get('datetime'):
            self.dates.append(a['datetime'])
    def handle_endtag(self,tag):
        if tag in ('script','style','noscript','svg') and self.skip:
            self.skip-=1
        if tag in ('title','h1'):
            self.title=False
    def handle_data(self,text):
        if not self.skip and text.strip():
            self.data.append(text)
            if self.title:
                self.headlines.append(text)

def tokens(s):
    return {w for w in re.findall(r'[a-z][a-z0-9-]{3,}',normalized(s)) if w not in STOP}

def good_scope(e):
    return e['kind'] in {'report','research','company','policy'} and not BLOCK.search(
        ' '.join(e[k][l] for k in ('title','summary','takeaway') for l in ('en','zh')))

def verified_text(e, quote, raw):
    if not good_scope(e) or not isinstance(quote,str) or not 42<=len(quote)<=220 or not 7<=len(quote.split())<=23:
        return False
    page=Page(); page.feed(raw)
    day=dt.date.fromisoformat(e['date'])
    explicit=page.dates + re.findall(r'"datePublished"\s*:\s*"([^"]{8,40})"',raw,re.I)
    visible=normalized(' '.join(page.data))
    variants=(day.isoformat(),day.strftime('%Y/%m/%d'),f'{day:%B} {day.day}, {day.year}',
              f'{day.day} {day:%b} {day.year}',f'{day:%b} {day.day}, {day.year}',
              f'{day.year}年{day.month}月{day.day}日')
    if explicit:
        date_ok=any(any(normalized(v) in normalized(d) for v in variants) for d in explicit)
    else:
        date_ok=any(normalized(v) in visible[:22000] for v in variants)
    quote_n=normalized(quote)
    support=tokens(quote+' '+' '.join(page.headlines))
    title=tokens(e['title']['en'])
    summary=tokens(e['summary']['en'])
    return bool(date_ok and quote_n in visible and len(title & support)>=2 and len(summary & support)>=3)

def fetch_verify(e, quote):
    # URLs have already passed the fixed primary-host allowlist in daily.py.
    # Do not follow redirects, use proxies, send headers containing credentials, or execute page code.
    class BlockRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,*args,**kwargs):
            return None
    u=e['source']['url']
    if urlsplit(u).scheme!='https' or not good_scope(e):
        return False
    req=urllib.request.Request(u,headers={'User-Agent':'ScalingLowSourceCheck/1.0','Accept':'text/html',
                                        'Accept-Encoding':'identity'})
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),BlockRedirect(),
                                      urllib.request.HTTPSHandler(context=ssl.create_default_context()))
    try:
        with opener.open(req,timeout=12) as resp:
            if resp.headers.get_content_type() not in ('text/html','application/xhtml+xml'):
                return False
            data=resp.read(1_500_001)
            return len(data)<=1_500_000 and verified_text(e,quote,data.decode('utf-8','replace'))
    except (OSError, ValueError, TypeError):
        return False
