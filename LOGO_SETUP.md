# 🎨 Logo Setup Guide for PetSmart Admin Dashboard

This guide explains how to properly set up and manage logos in the PetSmart Admin Dashboard.

## 📁 Asset Folder Structure

The application uses the following folder structure for assets:

```
admin-dashboard/
├── public/
│   └── assets/
│       └── images/
│           ├── petsmart-logo.svg          # Main wordmark logo
│           ├── petsmart-logo.png          # PNG version of main logo
│           ├── petsmart-logo.jpg          # JPG version of main logo
│           ├── petsmart-icon.svg          # Icon/symbol only
│           ├── petsmart-icon.png          # PNG version of icon
│           ├── petsmart-logo-white.svg    # White version for dark backgrounds
│           ├── petsmart-icon-white.svg    # White icon for dark backgrounds
│           └── logo-placeholder.svg       # Fallback placeholder (included)
└── src/
    └── assets/
        └── images/                        # For bundled assets (optional)
```

## 🖼️ Logo Requirements

### **Main Logo (Wordmark)**
- **Recommended format**: SVG (scalable, crisp at all sizes)
- **Alternative formats**: PNG (high resolution), JPG (if necessary)
- **Aspect ratio**: Wide/horizontal (typically 16:5 or similar)
- **Recommended size**: 200x62px minimum for SVG
- **Background**: Transparent (for SVG/PNG)

### **Icon/Symbol**
- **Format**: SVG preferred, PNG acceptable
- **Aspect ratio**: Square (1:1)
- **Recommended size**: 40x40px minimum for SVG
- **Use case**: Collapsed sidebar, mobile navigation, favicons

### **White Versions**
- **Purpose**: For use on dark backgrounds
- **Same requirements as main versions**
- **Ensure good contrast on dark surfaces**

## 📋 Installation Instructions

### **Step 1: Prepare Your Logo Files**

1. **Main Logo**: Save your PetSmart wordmark as `petsmart-logo.svg`
2. **Icon**: Save your PetSmart icon/symbol as `petsmart-icon.svg`
3. **White Versions**: Save white versions as `petsmart-logo-white.svg` and `petsmart-icon-white.svg`

### **Step 2: Place Files in Correct Location**

✅ **COMPLETED** - Your PetSmart logos are already properly placed!

Current logo files in `admin-dashboard/public/assets/images/`:
```bash
admin-dashboard/public/assets/images/
├── logo-petsmart.svg  ✅ (Currently active)
├── logo-petsmart.png  ✅ (Fallback)
└── logo-placeholder.svg (System fallback)
```

The system is now using your actual PetSmart logos!

### **Step 3: Configuration Status**

✅ **OPTIMIZED** - Configuration has been updated for your PetSmart wordmark!

Current settings in `src/config/assets.ts`:
```typescript
export const LOGO_CONFIG = {
  aspectRatio: {
    width: 20,  // Optimized for PetSmart wordmark
    height: 6   // Wide horizontal layout
  }
}
```

**Sizing optimized for PetSmart wordmark:**
- **Sidebar expanded**: 180x54px
- **Sidebar collapsed**: 36x36px (maintains readability)
- **Login page**: 240x72px (prominent display)
- **Mobile**: Responsive scaling maintained

## 🎯 Logo Usage Throughout the Application

The logo automatically appears in these locations:

### **1. Sidebar Navigation**
- **Expanded state**: Shows full wordmark logo
- **Collapsed state**: Shows icon only
- **Size**: Automatically responsive

### **2. Login Page**
- **Shows**: Full wordmark logo
- **Style**: Glassmorphism container with hover effects
- **Size**: Responsive based on screen size

### **3. App Header** (if implemented)
- **Shows**: Full wordmark logo
- **Size**: Compact version suitable for header

## 🔧 Customization Options

### **Changing Logo Sizes**

Edit `src/config/assets.ts` to adjust sizes for different contexts:

```typescript
sizes: {
  sidebarExpanded: {
    width: 160,    // Adjust width
    height: 50,    // Adjust height
    useIcon: false
  },
  loginPage: {
    width: 200,    // Adjust width
    height: 62,    // Adjust height
    useIcon: false
  }
}
```

### **Adding New Logo Variants**

1. Add new logo paths to `ASSETS.logos` in `src/config/assets.ts`
2. Update the `getLogo()` function to handle new variants
3. Place the new logo files in `public/assets/images/`

## 📱 Responsive Behavior

The logo system automatically handles:

- **Desktop**: Full wordmark in sidebar, appropriate sizing
- **Tablet**: Slightly smaller wordmark, maintains readability
- **Mobile**: Icon in collapsed sidebar, smaller wordmark in login
- **Dark Mode**: Automatically switches to white versions

## 🎨 Styling Guidelines

### **For Wordmark Logos**
- Ensure text remains readable at minimum size (120px width)
- Test on both light and dark backgrounds
- Maintain proper contrast ratios (4.5:1 minimum)

### **For Icon Logos**
- Should be recognizable at 32px size
- Simple, clear design that works in monochrome
- Avoid fine details that disappear when small

## 🔍 Testing Your Logo

After placing your logo files:

1. **Test all contexts**:
   - Sidebar (expanded and collapsed)
   - Login page
   - Light and dark themes
   - Different screen sizes

2. **Check fallback behavior**:
   - Temporarily rename a logo file to test fallback
   - Ensure fallback text displays properly

3. **Verify performance**:
   - SVG files should load quickly
   - No console errors about missing files

## 🚨 Troubleshooting

### **Logo Not Displaying**
- Check file path: `public/assets/images/petsmart-logo.svg`
- Verify file permissions
- Check browser console for 404 errors
- Ensure SVG is valid XML

### **Logo Too Large/Small**
- Adjust sizes in `src/config/assets.ts`
- Check CSS in `AppLogo.vue` component
- Verify aspect ratio settings

### **Dark Mode Issues**
- Ensure white logo versions exist
- Check contrast on dark backgrounds
- Verify `getLogo()` function logic

## 📞 Support

If you encounter issues with logo setup:

1. Check the browser console for errors
2. Verify file paths and naming conventions
3. Test with the included placeholder logo first
4. Review the `AppLogo.vue` component for customization options

---

**Note**: The application includes placeholder logos that demonstrate the proper sizing and behavior. Replace these with your actual PetSmart logos following the guidelines above.
