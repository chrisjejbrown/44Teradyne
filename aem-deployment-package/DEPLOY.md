# AEM CS Deployment Package - Teradyne Homepage

## Contents

- `content/dam/teradyne/homepage/` - 13 image assets for DAM upload
- `content/teradyne/index.plain.html` - Homepage content
- `content/teradyne/nav.plain.html` - Navigation content  
- `content/teradyne/footer.plain.html` - Footer content

## Deployment Steps

### 1. Upload Assets to DAM

Upload all files from `content/dam/teradyne/homepage/` to AEM Assets:

**Target folder:** `/content/dam/teradyne/homepage/`

Use AEM Assets UI or the Assets HTTP API:
```
POST https://author-p107109-e1000961.adobeaemcloud.com/api/assets/teradyne/homepage
```

### 2. Publish Assets

Publish all uploaded assets so the delivery pipeline can resolve them.

### 3. Import Page Content

The `.plain.html` files contain the page markup with field hints for Universal Editor.

Upload page content to JCR at:
- `/content/teradyne/index` (homepage)
- `/content/teradyne/nav` (navigation fragment)
- `/content/teradyne/footer` (footer fragment)

### 4. Verify

Preview at: `https://main--teradyne--chrisjejbrown.aem.page/`

## Image References

All images in the content HTML use full DAM paths:
```
/content/dam/teradyne/homepage/<filename>
```

The franklin.delivery servlet transforms these to media bus URLs at delivery time.

## Project Config

- **Author:** author-p107109-e1000961.adobeaemcloud.com
- **Site path:** /content/teradyne
- **DAM path:** /content/dam/teradyne
- **Delivery:** markup type with .html suffix
