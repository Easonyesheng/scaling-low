# Scaling Low ↘

**Scale is all you owe.**

[Visit Scaling Low ↗](https://scalinglow.com/)

Scaling Low is a small joke about a very big industry.

In AI, scaling laws describe how model performance changes with more parameters, more data, and more compute. Somewhere along the way, a useful empirical observation became a much broader belief: whatever the question, the answer must be bigger.

We find that belief funny. Especially when the invoice arrives.

## From scaling law to scaling low

One letter changes the research direction.

Scaling Low follows the other curves: the shrinking budget, the diminishing returns, the distance between a benchmark improvement and something you actually needed. When every announcement promises more, we are interested in how little might be enough.

A smaller model. A simpler tool. A regular expression with suspiciously good performance. The radical possibility that the task was already solved.

## Our working hypotheses

- **Bigger is a measurement, not a mission.** A model's size tells us very little about whether it is the right tool for a particular job.
- **The invoice is a benchmark, too.** Compute, energy, latency, and money belong in the conversation about progress.
- **Enough deserves a research agenda.** Meeting a real need with fewer resources is an achievement worth naming.
- **Expectations can scale down.** Every autocomplete does not need to be the first spark of a new civilization.

## Deeply unserious research

The site borrows the visual language of a research lab: a confident headline, a smooth curve, a few numbers, and conclusions that may require further funding.

Drag the compute slider. Watch the bill grow. Watch the score flatten. All chart values and prices are made up; the enthusiasm for spending more is widely available.

The joke is aimed at the habit of treating scale as its own justification. There is plenty to admire in AI research, and plenty to laugh at in the stories we tell about it.

## The lower ambition

Build things that earn their complexity. Celebrate useful work done on modest hardware. Leave room for experiments whose main contribution is a good joke.

And occasionally ask:

> What if we scaled the expectations down?

---

## Local preview and news updates

From the repository root, run `python3 -m http.server` and open `http://localhost:8000/`. Opening the HTML as a file will not load the news feed.

Add an object to `entries` in `news.json` using a unique `id`, ISO publication date (`YYYY-MM-DD`), `topic` (misuse, reliability, governance, infrastructure), and `kind` (report, proposal, research, company). Supply `en` and `zh` strings for `title`, `summary`, `takeaway`, and `source.label`, plus the original HTTPS `source.url`. Keep the source’s observation in the summary and the editorial reading in the takeaway. Display order is newest first.

### Bubble countdown

`bubble.json` is a separately reviewed editorial snapshot, not an output of the hourly DSH news job. The homepage calculates the single countdown from its two timezone-qualified track dates and integer weights (total 100), and falls back to the original checkpoint if the snapshot is unavailable. Follow [the analysis guide](prompts/BUBBLE_TIMING_ANALYSIS.md) when updating the observation points, the evidence and the snapshot date together.
