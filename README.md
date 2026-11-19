# Scaling Low ↘

**Scale is all you owe.**

A small joke about a very big industry. A satirical research homepage about scaling laws, diminishing returns, and GPU invoices. All chart values and prices are fictional.

## Local preview

No dependencies or build step required. Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publish with GitHub Pages

1. Commit and push these files to the `main` branch of `Easonyesheng/scaling-low`.
2. Open https://github.com/Easonyesheng/scaling-low/settings/pages.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open https://github.com/Easonyesheng/scaling-low/actions and select **Deploy GitHub Pages → Run workflow → main → Run workflow**. Later pushes to `main` deploy automatically.
5. After the workflow succeeds, visit https://easonyesheng.github.io/scaling-low/.

The repository must have GitHub Pages available for its visibility and account plan. If an initial workflow fails before Pages is enabled, enable it in step 3, then rerun the workflow.

## Files

- `index.html`: page structure and copy.
- `style.css`: responsive design. Google Fonts are optional; system fonts serve as fallbacks.
- `script.js`: illustrative chart and compute slider.
- `.github/workflows/pages.yml`: deploys only the three site files to GitHub Pages.

This project uses no analytics, backend, or paid services.
