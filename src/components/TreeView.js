import {
  JsonView,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

function TreeView({ data }) {
  const theme = "monokai"; // You can choose a different theme

  return (
    <JsonView
      data={data}
      shouldExpandNode={collapseAllNested}
      style={darkStyles}
    />
  );
}

export default TreeView;
