---
"@opentui-ui/dialog": minor
---

### Breaking Changes

- **React content must be a function**: `content: () => <MyDialog />` instead of `content: <MyDialog />`
- **Backdrop options moved to top-level**: `backdropColor` and `backdropOpacity` are now on `DialogShowOptions`/`DialogContainerOptions`, not nested in `style`
- **Removed `backdropMode`**: Backdrop stacking mode option has been removed

### Bug Fixes

- Fixed `confirm()` and `choice()` ignoring `fallback` option in core
- Fixed `ChoiceOptions<K>` generic type not properly typing `fallback`
- Fixed focus restore timing when rapidly opening/closing dialogs

### Improvements

- Added missing exports
- Per-dialog `closeOnEscape` option now supported

---

⚠️ **Migration**: See the [README](https://github.com/msmps/opentui-ui/blob/main/packages/dialog/README.md) for updated usage examples. While this release contains breaking changes, we're still in early development (0.x). The API is now stabilized and no further breaking changes are planned.
