
"use client"

import axios from "axios";
import { useEffect, useState, useRef } from 'react';
import styles from "./page.module.css";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';




const cellSize = '50px'; 

export default function Home() {

  const [products,  setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    const [isProductVisible, setIsProductVisible] = useState<boolean[][]>([]);
    const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
     const [draggingIndex, setDraggingIndex] = useState<{
       row: number;
       col: number;
     } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>('https://fakestoreapi.com/products');
        console.log(response.data)
        setProducts(response.data);
        setIsProductVisible(new Array(4).fill(false).map(() => new Array(5).fill(false)));
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }


  
  const toggleProductVisibility = (rowIndex: number, colIndex: number) => {
    const newVisibility = [...isProductVisible];
    newVisibility[rowIndex][colIndex] = !newVisibility[rowIndex][colIndex];
    setIsProductVisible(newVisibility);
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    if (!focusedCell) return;

    const { key } = event;
    let newRow = focusedCell.row;
    let newCol = focusedCell.col;

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, focusedCell.row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(3, focusedCell.row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, focusedCell.col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(4, focusedCell.col + 1);
        break;
      case 'Enter':
        toggleProductVisibility(newRow, newCol);
        return;

      default:
        return;
    }

       setFocusedCell({ row: newRow, col: newCol });
       const cell = tableRef.current?.rows[newRow + 1]?.cells[newCol]; // +1 to account for header row
       cell?.focus();

  };


    const handleDragStart = (row: number, col: number) => {
      setDraggingIndex({ row, col });
    };

    const handleDrop = (row: number, col: number) => {
      if (draggingIndex) {
        const sourceIndex = draggingIndex.row * 5 + draggingIndex.col;
        const targetIndex = row * 5 + col;

        const newProducts = [...products];
        [newProducts[sourceIndex], newProducts[targetIndex]] = [
          newProducts[targetIndex],
          newProducts[sourceIndex],
        ];

        setProducts(newProducts);
        setDraggingIndex(null);
      }
    };


      const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
      };



 

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "100%", overflowX: "auto" }}
    >
      <Table
        ref={tableRef}
        onKeyDown={handleKeyDown}
        tabIndex={0} // Allow the table to receive focus
        sx={{ minWidth: 400, tableLayout: "fixed", border: "1px solid white" }}
      >
        <TableBody>
          {[0, 1, 2, 3].map((row) => (
            <TableRow key={row} sx={{ "&:last-child td": { borderBottom: 0 } }}>
              {[0, 1, 2, 3, 4].map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    width: "20vh",
                    height: "30vh",
                    p: 0,
                    border: "1px solid white",
                    outline:
                      focusedCell?.row === row && focusedCell?.col === col
                        ? "2px solid blue"
                        : "none",
                  }}
                  onClick={() => {
                    setFocusedCell({ row, col });
                    toggleProductVisibility(row, col);
                  }}
                  tabIndex={-1} // Allow the cell to receive focus
                  onFocus={() => setFocusedCell({ row, col })} // Track focused cell
                  onDragStart={() => handleDragStart(row, col)}
                  onDrop={() => handleDrop(row, col)}
                  onDragOver={handleDragOver}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "black",

                      color: isProductVisible[row][col]
                        ? "initial"
                        : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                      "&:hover": { bgcolor: "gray" },
                    }}
                  >
                    {isProductVisible[row][col] && products[row * 5 + col] ? (
                      <div className={styles.container}>
                        <img
                          className={styles.imgpro}
                          src={products[row * 5 + col].image}
                          alt={products[row * 5 + col].title}
                          width="100"
                          height="100"
                        />
                        <Typography
                          className={styles.titlepro}
                          variant="caption"
                        >
                          {products[row * 5 + col].title}
                        </Typography>
                      </div>
                    ) : (
                      <Typography variant="body2"></Typography>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
