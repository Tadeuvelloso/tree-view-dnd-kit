import { SortableTree } from './components';
import { testData } from './data/mockData';
import './App.css';

export default function App() {

  const handleCanDrop = (_source: any, target: any): boolean => {
    if (target?.metadata?.editable === false) {
      return false;
    }
    
    if (target?.metadata?.owner === 'system' || target?.metadata?.owner === 'admin') {
      return false;
    }
    
    if (target?.metadata?.type === 'system') {
      return false;
    }
    
    return true;
  };

  const handleCanDrag = (item: any): boolean => {
    if (item?.metadata?.editable === false) {
      return false;
    }
    
    if (item?.metadata?.owner === 'system' || item?.metadata?.owner === 'admin') {
      return false;
    }
    
    if (item?.metadata?.type === 'system') {
      return false;
    }
    
    return true;
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1 className="app-title">Tree View with Dnd-kit</h1>
      </div>
      
      <div className="trees-container">
        <div className="tree-section">
          <h2 className="tree-title">Tree com canChangeParent = true</h2>
          <SortableTree
            defaultItems={testData}
            indentationWidth={50}
            maxDepth={2}
            canDrop={handleCanDrop}
            canDrag={handleCanDrag}
            canChangeParent={true}
          />
        </div>
        
        <div className="tree-section">
          <h2 className="tree-title">Tree com canChangeParent = false</h2>
          <SortableTree
            defaultItems={testData}
            indentationWidth={50}
            maxDepth={2}
            canDrop={handleCanDrop}
            canDrag={handleCanDrag}
            canChangeParent={false}
          />
        </div>
      </div>
    </div>
  );
}
