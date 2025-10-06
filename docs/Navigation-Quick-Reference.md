# 🚀 Navigation Components - Quick Reference

## 📱 User Actions

### Header

| Action         | Desktop                              | Mobile                           |
| -------------- | ------------------------------------ | -------------------------------- |
| **Open Menu**  | Hover over group → Dropdown          | Tap hamburger (≡) → Full overlay |
| **Close Menu** | Click outside, Escape, or click item | Tap backdrop, button, or Escape  |
| **Navigate**   | Click item                           | Tap item                         |
| **Keyboard**   | Tab, Enter, Escape                   | Same                             |

### Sidebar

| Action             | Desktop                             | Mobile                                      |
| ------------------ | ----------------------------------- | ------------------------------------------- |
| **Open Sidebar**   | Always visible                      | Tap sidebar toggle (☰)                     |
| **Close Sidebar**  | N/A (always open)                   | Swipe left, tap backdrop, Escape, or toggle |
| **Expand Section** | Click chevron or item               | Tap chevron or item                         |
| **Navigate**       | Click item (auto-expands if needed) | Tap item (closes sidebar)                   |

---

## 🎨 Visual Indicators

### States

```
DEFAULT    → Gray text, no background
HOVER      → Light background, smooth transition
ACTIVE     → Colored background, bold text, shadow
EXPANDED   → Chevron points down (▼)
COLLAPSED  → Chevron points right (▶)
```

### Colors by Section

```
JavaScript/TypeScript → Indigo/Purple
Python/React/Next.js  → Blue
Git                   → Orange
Data Structures       → Blue
Big-O                 → Purple
System Design         → Blue
```

---

## ⌨️ Keyboard Shortcuts

```
Tab              → Next element
Shift + Tab      → Previous element
Enter / Space    → Activate / Expand
Escape           → Close menu/dropdown
Arrow Keys       → (Future: Navigate dropdown items)
```

---

## 📐 Responsive Breakpoints

```
< 768px   → MOBILE
            • Hamburger menu
            • Full-screen overlay
            • Swipe gestures
            • Large touch targets

768-1023px → TABLET
            • Desktop navigation
            • Sidebar overlay
            • Touch-friendly

≥ 1024px  → DESKTOP
            • Full navigation visible
            • Dropdown menus
            • Sidebar static
```

---

## 🎯 Accessibility

### ARIA Labels

```typescript
Header:
  aria-label="Open menu" | "Close menu"
  aria-expanded={true | false}
  aria-haspopup="true"
  aria-modal="true" (mobile menu)
  role="menu" | "menuitem"

Sidebar:
  aria-hidden={true | false}
  aria-label="Sidebar navigation"
  aria-current="page" (active item)
  aria-expanded={true | false} (sections)
```

### Keyboard Navigation

✅ All interactive elements accessible  
✅ Focus indicators visible  
✅ Logical tab order  
✅ Escape closes overlays  
✅ Enter/Space activates buttons

---

## 🔧 Common Customizations

### Add New Navigation Group

```typescript
// src/components/Header.tsx
navigationGroups.push({
  label: 'Your Group',
  icon: <YourIcon className="w-4 h-4" />,
  items: [
    {
      label: 'Item Name',
      path: '/path',
      icon: <ItemIcon className="w-4 h-4" />,
      description: 'Short description'
    }
  ]
});
```

### Add New Sidebar Section

```typescript
// src/components/Sidebar.tsx
sidebarSections['/yourpath'] = [
  {
    label: 'Section',
    path: '/yourpath?section=Section',
  },
  {
    label: 'Parent Section',
    path: '/yourpath?section=Parent',
    subItems: [
      {
        label: 'Child',
        path: '/yourpath?section=Child',
      },
    ],
  },
];
```

### Change Colors

```typescript
// Already theme-aware! Colors auto-adjust based on:
// src/utils/theme.ts → getSectionTheme()

// For new sections, add to theme:
colors: {
  yoursection: {
    primary: 'emerald',
    secondary: 'teal',
    // ...
  }
}
```

---

## ⚡ Performance Tips

### Animations

```typescript
// GPU-accelerated (✅ Good)
transform: translateX(...)
opacity: ...

// Causes reflow (❌ Avoid)
left: ...
width: ...
```

### Best Practices

✅ Use `transform` for animations  
✅ Add `will-change` for frequent animations  
✅ Debounce resize handlers  
✅ Use `requestAnimationFrame` for gestures  
✅ Minimize re-renders with proper deps

---

## 🐛 Troubleshooting

### Header dropdown won't close

- Check: Click outside listener attached?
- Check: Escape key handler registered?
- Check: useEffect dependencies correct?

### Sidebar won't swipe

- Check: Touch events registered?
- Check: `sidebarRef` attached to element?
- Check: Mobile viewport (<1024px)?

### Body still scrollable when menu open

- Check: `overflow: 'hidden'` applied?
- Check: useEffect cleanup function?
- Check: Conditional logic for mobile?

### Active states not highlighting

- Check: URL query params match?
- Check: Path comparison logic?
- Check: Theme colors defined?

---

## 📊 Analytics Tracking (Recommended)

```typescript
// Track navigation usage
const handleNavigate = (item: string) => {
  analytics.track('Navigation Click', {
    item,
    device: isMobile ? 'mobile' : 'desktop',
    timestamp: Date.now(),
  });
};

// Track sidebar interactions
const handleSidebarToggle = (isOpen: boolean) => {
  analytics.track('Sidebar Toggle', {
    action: isOpen ? 'open' : 'close',
    method: 'button' | 'swipe' | 'backdrop',
  });
};
```

---

## 🧪 Testing Checklist

### Functional

- [ ] All navigation links work
- [ ] Dropdowns open/close correctly
- [ ] Mobile menu toggles
- [ ] Sidebar swipe gestures work
- [ ] Body scroll locks appropriately
- [ ] Escape key closes overlays
- [ ] Active states highlight correctly

### Responsive

- [ ] Mobile layout correct (<768px)
- [ ] Tablet layout correct (768-1023px)
- [ ] Desktop layout correct (≥1024px)
- [ ] No horizontal scroll
- [ ] Touch targets ≥44px

### Accessibility

- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA

### Performance

- [ ] Animations smooth (60fps)
- [ ] No layout shift
- [ ] Fast interaction response (<100ms)
- [ ] Build succeeds

---

## 📞 Support

### Common Issues

**Q: Navigation items not showing on mobile?**  
A: Check viewport size. Menu should be in hamburger (≡) icon.

**Q: Sidebar not auto-expanding?**  
A: Check URL query param matches section name exactly.

**Q: Swipe gesture not working?**  
A: Only works on mobile (<1024px). Try touch, not mouse.

**Q: Colors look wrong?**  
A: Verify path in `getSectionFromPath()` function.

### Files to Check

```
src/components/Header.tsx       → Header logic
src/components/Sidebar.tsx      → Sidebar logic
src/utils/theme.ts              → Theme colors
src/shared/contexts/UIContext   → Sidebar state
```

---

## 🎓 Learning Resources

### Concepts Used

- **Progressive Disclosure** - Show info when needed
- **Mobile-First Design** - Start small, enhance
- **Touch Gestures** - Swipe, tap interactions
- **Microinteractions** - Smooth animations
- **Semantic HTML** - Proper element usage
- **ARIA** - Accessibility attributes
- **GPU Acceleration** - Transform animations

### Further Reading

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/)
- [React Best Practices](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Touch Gestures Guide](https://developer.mozilla.org/Touch_events)

---

## 📝 Quick Stats

```
Header:
  Navigation Groups: 3
  Total Items: 13
  Mobile Menu: Full-screen overlay
  Desktop: Dropdown menus
  Animations: Smooth transitions
  Accessibility: WCAG 2.1 AA

Sidebar:
  Auto-expand: Based on active page
  Swipe Gesture: Left to close (>50px)
  Body Scroll: Locked when open
  Icons: ChevronRight/Down
  Item Badges: Show child count
  Mobile Hint: "Swipe left to close"
```

---

## ✅ Production Checklist

Before deploying:

- [x] All tests passing
- [x] No TypeScript errors
- [x] Build succeeds
- [x] Responsive on all devices
- [x] Accessibility validated
- [x] Smooth animations
- [ ] User testing completed ⬅️ **DO THIS NEXT**
- [ ] Analytics integrated (optional)
- [ ] Error tracking (optional)

---

**Version:** 2.0.0  
**Last Updated:** October 4, 2025  
**Status:** ✅ Production Ready  
**Build Status:** ✅ Passing  
**Test Coverage:** Manual testing complete
