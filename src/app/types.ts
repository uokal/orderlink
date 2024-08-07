export interface Column {
  title: string;
  dataIndex: string;
  key: string;
  sorter: boolean; // Ensure this is always boolean, not boolean | undefined
  editable: boolean;
  visible: boolean;
}