# 🌳 Tree View with DnD Kit

A powerful, flexible tree view component built with React and @dnd-kit, featuring drag-and-drop functionality with advanced controls.

## ✨ Features

- **🎯 Full Item Drag & Drop** - Entire tree items are draggable with smart click vs drag detection
- **🔄 Collapsible Nodes** - Expand/collapse tree nodes
- **📏 Depth Limiting** - Control maximum render depth
- **🚫 Drop Restrictions** - Custom drop validation logic  
- **🔒 Parent Control** - Restrict parent changes
- **🛡️ Drag Permissions** - Control which items can be dragged
- **🎨 Custom Rendering** - Render items with custom components
- **👆 Item Interactions** - Handle item clicks with custom logic
- **⚡ Performance Optimized** - Efficient rendering and state management

## 🚀 Installation

```bash
npm install
npm run dev
```

## 📖 API

### Main Props
- `defaultItems` - Initial tree data
- `maxDepth` - Maximum render depth (0-based)
- `canDrop` - Custom drop validation function
- `canDrag` - Control which items can be dragged
- `canChangeParent` - Allow changing item parents
- `indentationWidth` - Indentation width in pixels
- `renderItem` - Custom render function for items

### Data Structure
Tree items require: `id`, `title`, `children` array. Optional: `collapsed`, `metadata`.

## 🎯 Use Cases

- **File Browsers** - With folder depth limits and file type restrictions
- **Menu Systems** - With hierarchical navigation and permissions
- **Organizational Charts** - With role-based drag restrictions
- **Content Management** - With user ownership validation
- **Project Management** - With task hierarchy and status controls

## 📦 Built With

- React 18+
- @dnd-kit (core, sortable, utilities)
- TypeScript
- CSS Modules
