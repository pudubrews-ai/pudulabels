# Pudulabels Roadmap

## High Priority: Dynamic Label Size Configuration

**Goal:** Replace hardcoded dimensions with config-driven system supporting inch-based input

**Estimated Effort:** ~1 hour total  
**Risk Level:** Low (layout logic already exists, just needs parameterization)

### Phase 1: Core Configuration (30-45 mins)
1. **Create `config.json`** with inch-based dimensions
   - Label width/height in inches
   - Margins, QR size, layout spacing
   - Validation limits for reasonable printer sizes

2. **Add config loading in `server.js`**
   - Load and validate config on startup
   - Convert inches to points (multiply by 72) for PDF
   - Provide fallback to current 3"x2" dimensions

3. **Replace hardcoded values** with calculated dimensions:
   - PDF size: `[width*72, height*72]` instead of `[216, 144]`
   - Border rect: `(2, 2, width*72-4, height*72-4)` instead of `(2, 2, 212, 140)`
   - QR positioning: `(width*72 - qrSize - 8, 8)` instead of `(216 - qrSize - 8, 8)`
   - Content width: `width*72 - leftMargin - rightMargin` instead of `216 - leftMargin - rightMargin`

### Phase 2: CSS Integration (15-30 mins)
4. **Add endpoint** to serve dynamic CSS with config values
5. **Update preview dimensions** to scale with actual label size
6. **Ensure mobile responsive** scaling works with new dimensions

### Phase 3: Validation & Polish (15 mins)
7. **Add config validation** for reasonable printer limits
8. **Provide clear error messages** for invalid configurations
9. **Test with different label sizes** to ensure layout adapts properly

## Benefits
- **Single source of truth** for all dimensions
- **Inch-based input** (more intuitive than points/pixels)
- **Easy customization** without code changes
- **Consistent scaling** across PDF and preview

## Current State Analysis
- **Hardcoded elements:** PDF size, border rect, QR positioning
- **Adaptive elements:** Font sizing, content width calculations, margin logic
- **Issue:** Layout would break if dimensions changed due to hardcoded values

## Implementation Notes
- Keep existing 3"x2" as default fallback
- Preserve existing layout logic (just parameterize it)
- Validate config on startup to catch errors early
- Most work is find-and-replace of hardcoded numbers with calculated values