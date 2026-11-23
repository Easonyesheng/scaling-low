"""Mechanically append only validated DSH candidates from this run."""
import copy
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
from daily import canonical, validate

def append(news,payload,sha,today):
    if (news.get('schemaVersion')!=1 or not isinstance(news.get('entries'),list)
            or payload.get('schemaVersion')!=1 or payload.get('source_commit')!=sha
            or not re.fullmatch(r'[0-9a-f]{40}',sha)):
        raise ValueError('source version mismatch')
    entrants=payload.get('entries')
    if entrants==[]: return news,0
    if payload.get('dsh_live_search') is not True or payload.get('official_feed_verified') is not True:
        raise ValueError('missing publication gates')
    if not isinstance(entrants,list) or not 1<=len(entrants)<=2:
        raise ValueError('candidate count invalid')
    urls={canonical(a['source']['url']) for a in entrants}
    result=validate({'entries':copy.deepcopy(entrants)},news['entries'],urls,today)
    if len(result)!=len(entrants):
        raise ValueError('validation changed candidate count')
    output=copy.deepcopy(news)
    output['entries'].extend(result)
    return output,len(result)

if __name__=='__main__':
    current=Path(sys.argv[1]); payload=Path(sys.argv[2]); output=Path(sys.argv[3])
    if current.stat().st_size>1_000_000 or payload.stat().st_size>12_000:
        raise ValueError('file size')
    result,count=append(json.loads(current.read_text(encoding='utf-8')),
                        json.loads(payload.read_text(encoding='utf-8')),os.environ['SOURCE_SHA'],
                        dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date())
    if count:
        current.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with output.open('a',encoding='utf-8') as out:
        out.write(f'changed={"yes" if count else "no"}\n')
    print(f'Verified append: {count} candidate(s).')
