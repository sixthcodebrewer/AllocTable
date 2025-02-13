import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Button, TextField } from '@mui/material';
/* eslint-disable */
const newData = [
    {
        "rows": [
          {
            "id": "electronics",
            "label": "Electronics",
            "value": 1500, //this value needs to be calculated from the children values (800+700)
            "children": [
              {
                "id": "phones",
                "label": "Phones",
                "value": 800
              },
              {
                "id": "laptops",
                "label": "Laptops",
                "value": 700
              }
            ]
          },
          {
            "id": "furniture",
            "label": "Furniture",
            "value": 1000, //this need to be calculated from the children values (300+700)
            "children": [
              {
                "id": "tables",
                "label": "Tables",
                "value": 300
              },
              {
                "id": "chairs",
                "label": "Chairs",
                "value": 700
              }
            ]
          }
        ]
      }
]


const Table = () => {
  const [tableData, setTableData] = useState(newData[0].rows);
  const [inputValues, setInputValues] = useState({});
  const [originalData] = useState(newData[0].rows); // Store original values
  const [totals, setTotals] = useState({ totalValue: 0, variance: 0 });

  const calculateTotals = () => {
    const totalValue = tableData.reduce((sum, row) => sum + row.value, 0);
    const originalTotalValue = originalData.reduce((sum, row) => sum + row.value, 0);
    const variance = totalValue - originalTotalValue;
    return { totalValue, variance };
  };


  const updateRowValue = (rowId, newValue, updateParent = true) => {
    setTableData(prevData => {
      const updateRows = (rows) => {
        return rows.map(row => {
          if (row.id === rowId) {
            return { ...row, value: newValue };
          }
          if (row.children) {
            const updatedChildren = updateRows(row.children);
            // Recalculate parent value if updateParent is true
            const newParentValue = updateParent 
              ? updatedChildren.reduce((sum, child) => sum + child.value, 0)
              : row.value;
            return { 
              ...row, 
              children: updatedChildren,
              value: newParentValue 
            };
          }
          return row;
        });
      };
      return updateRows(prevData);
    });
  };

  const handlePercentageAllocation = (row) => {
    const inputValue = inputValues[row.id] || 0;
    const percentage = parseFloat(inputValue) / 100;
    const increment = row.value * percentage;
    updateRowValue(row.id, row.value + increment);
  };

  const handleValueAllocation = (row) => {
    const newValue = parseFloat(inputValues[row.id] || 0);
    updateRowValue(row.id, newValue);
  };

  // Helper function to find original row values
  const findOriginalRow = (data, id) => {
    for (const row of data) {
      if (row.id === id) return row;
      if (row.children) {
        const found = findOriginalRow(row.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    setTotals(calculateTotals());
  }, [tableData]); 


  const columns = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: 'Category',
      },
      {
        accessorKey: 'value',
        header: 'Value',
      },
      {
        id: 'actions',
        header: 'Input',
        Cell: ({ row }) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={inputValues[row.original.id] || ''}
                onChange={(e) => setInputValues(prev => ({
                  ...prev,
                  [row.original.id]: e.target.value
                }))}
                style={{ width: '100px' }}
              />
            </div>
          ),
      },
      {
        id: 'allocation',
        header: 'Allocation%',
        Cell: ({ row }) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <Button 
              variant="contained" 
              size="small"
              onClick={() => handlePercentageAllocation(row.original)}
            >
              Submit
            </Button>
            </div>
          ),
      },
      {
        id: 'allocationval',
        header: 'Allocation Val',
        // eslint-disable-next-line react/prop-types
        Cell: ({ row }) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <Button 
              variant="contained" 
              size="small"
              onClick={() => handleValueAllocation(row.original)}
            >
              Submit Val
            </Button>
            </div>
          ),
      },
      {
        id: 'variance',
        header: 'Variance %',
        Cell: ({ row }) => {
          const originalRow = findOriginalRow(originalData, row.original.id);
          const variance = ((row.original.value - originalRow.value) / originalRow.value) * 100;
          return (
            <div style={{ color: variance < 0 ? 'red' : variance > 0 ? 'green' : 'black' }}>
              {variance.toFixed(2)}%
            </div>
          );
        },
      },
    ],
    [inputValues, originalData],
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableExpandAll: false,
    enableExpanding: true,
    filterFromLeafRows: true,
    getSubRows: (row) => row.children,
    initialState: { 
      expanded: true,
      density: 'compact'
    },
    paginateExpandedRows: false,
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', fontWeight: 'bold', width:'25%' }}>
        <div>Total Value:</div>
        <div>{totals.totalValue.toFixed(2)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', fontWeight: 'bold' , width:'25%'}}>
        <div>Total Variance:</div>
        <div style={{ color: totals.variance < 0 ? 'red' : totals.variance > 0 ? 'green' : 'black' }}>
          {totals.variance.toFixed(2)}
        </div>
      </div>
    </>
  );
};

export default Table;
