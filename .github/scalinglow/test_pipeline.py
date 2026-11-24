"""Offline regression tests for the publication contract (no credentials/network)."""
from collections import Counter
from copy import deepcopy
from datetime import date
import json
from pathlib import Path
import re
import unittest

from daily import canonical, editorial_guide, validate, KINDS, bind_source_labels, apply_model_settings, make_patch
from publish import append
from official_feeds import parse

ROOT = Path(__file__).resolve().parents[2]
TODAY = date(2026, 11, 24)
SHA = 'a' * 40
URL = 'https://www.nist.gov/news/ai-oversight-proposal'


def draft(url=URL, eid='ai-oversight-proposal'):
    return {'id': eid, 'date': TODAY.isoformat(), 'topic': 'governance', 'kind': 'proposal',
            'title': {'en': 'NIST proposes oversight for AI testing', 'zh': '美国国家标准与技术研究院提出AI评估方案'},
            'summary': {'en': 'The proposed process covers testing.', 'zh': '提案覆盖评估过程。'},
            'takeaway': {'en': 'Not an enacted rule.', 'zh': '尚未生效。'},
            'source': {'url': url, 'label': {'en': 'NIST proposal', 'zh': '研究院提案'}}}


def payload(entries):
    return {'schemaVersion': 1, 'source_commit': SHA, 'entries': entries, 'dsh_live_search': True,
            'official_feed_verified': True, 'citations': {canonical(e['source']['url']): e['date'] for e in entries}}


class Pipeline(unittest.TestCase):
    def test_astra_settings_are_consistent_and_cost_bounded(self):
        request = {'model':'obsolete','reasoning':{'effort':'none','summary':'auto'},
                   'max_output_tokens':5000,'temperature':0.2,'top_p':0.9,'top_logprobs':1,
                   'prompt_cache_retention':'24h','store':True,'service_tier':'ultrafast',
                   'include':['reasoning.encrypted_content','message.output_text.logprobs']}
        apply_model_settings(request)
        self.assertEqual(request, {'model':'gpt-6.2-astra','reasoning':{'effort':'low','summary':'auto'},
                                  'max_output_tokens':2100,'store':False,'service_tier':'default',
                                  'include':['reasoning.encrypted_content']})
        patches = {p.get('id'): p for p in make_patch('http://127.0.0.1:12345')}
        default_model = patches['agent-default-model']['config']
        provider = patches['llm-pi-ai']['config']['providers']['openai']
        self.assertEqual(default_model, {'provider':'openai','model':request['model']})
        self.assertEqual(provider['models'][0]['id'], request['model'])
        self.assertEqual(provider['models'][0]['maxTokens'], request['max_output_tokens'])
        self.assertEqual(provider['retryPolicy']['maxRetries'], 0)

    def test_generator_kinds_are_renderable(self):
        script = (ROOT / 'script.js').read_text(encoding='utf-8')
        html_kinds = re.search(r'const kinds = \{([^\n]+)\};', script)[1]
        self.assertLessEqual(KINDS, set(re.findall(r'(\w+):\[', html_kinds)))

    def test_guide_is_loaded_and_bounded(self):
        guide = editorial_guide(ROOT / 'prompts/NEWS_HEADLINE_GUIDE.md')
        self.assertIn('关键人物或著名机构', guide)
        self.assertNotIn('同一条新闻的预览与详情对应关系', guide)

    def test_feed_errors_are_not_empty_days(self):
        with self.assertRaisesRegex(ValueError, 'not_a_feed'):
            parse(b'<html><title>Access error</title></html>', 'NIST', TODAY, canonical)
        self.assertEqual(parse(b'<rss><channel></channel></rss>', 'NIST', TODAY, canonical), [])

    def test_registry_labels_keep_names_like_arxiv_publishable(self):
        url = 'https://arxiv.org/abs/2611.12345'
        row = draft(url)
        row.pop('source')
        row['source_url'] = url
        evidence = {url: {'publisher': 'arXiv cs.AI', 'date': TODAY.isoformat()}}
        response = bind_source_labels({'entries': [row]}, evidence)
        entries = validate(response, [], {url: TODAY.isoformat()}, TODAY)
        self.assertEqual(entries[0]['source']['label'], {'en': 'arXiv cs.AI', 'zh': 'arXiv 人工智能'})
        issues = Counter()
        result = validate(response, [], {}, TODAY, issues)
        self.assertEqual(result, [])
        self.assertEqual(issues, {'uncited_source': 1})

    def test_rejection_is_diagnosable_and_partial_batch_survives(self):
        bad = draft(eid='bad-date')
        bad['date'] = '2026-11-23'
        rejected = Counter()
        good = draft('https://arxiv.org/abs/2611.12345', 'good')
        source_dates = {URL: TODAY.isoformat(), good['source']['url']: TODAY.isoformat()}
        self.assertEqual(validate({'entries': [bad, good]}, [], source_dates, TODAY, rejected), [good])
        self.assertEqual(rejected, {'source_date': 1})

    def test_append_against_current_main_skips_new_duplicates(self):
        published = draft(URL + '?utm_source=rss', 'already-there')
        new = draft('https://arxiv.org/abs/2611.12345', 'new-item')
        latest = {'schemaVersion': 1, 'entries': [draft()]}
        before = deepcopy(latest)
        updated, ids = append(latest, payload([published, new]), SHA, TODAY)
        self.assertEqual(latest, before)
        self.assertEqual(ids, ['new-item'])
        self.assertEqual(updated['entries'], latest['entries'] + [new])

    def test_verifier_rejects_artifact_with_mismatched_date_or_provenance(self):
        archive = json.loads((ROOT / 'news.json').read_text(encoding='utf-8'))
        candidate = payload([draft()])
        candidate['citations'][URL] = '2026-11-23'
        with self.assertRaisesRegex(ValueError, 'publishing validation'):
            append(archive, candidate, SHA, TODAY)
        with self.assertRaisesRegex(ValueError, 'source version mismatch'):
            append(archive, candidate, 'c' * 40, TODAY)


if __name__ == '__main__':
    unittest.main()
