import { SortableTree } from './components';
import { testData } from './data/mockData';
import './App.css';

export default function App() {

  const handleCanDrop = (_source: any, _target: any): boolean => {

    
    return true;
  };

  const handleCanDrag = (_item: any): boolean => {
    
    return true;
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1 className="app-title">Tree View with Dnd-kit</h1>
      </div>
      
      <div className="trees-container">
        <div className="tree-section">
          <SortableTree
            defaultItems={testData}
            indentationWidth={50}
            maxDepth={4}
            canDrop={handleCanDrop}
            canDrag={handleCanDrag}
            canChangeParent={true}
            indicator={true}
          />
        </div>
        
       
      </div>
    </div>
  );
}
