import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Button from "@mui/material/Button";

import { distributeRewards } from 'src/store/slices/admin-slice';

import Moralis from "moralis";
import { useMoralisQuery } from "react-moralis";
import { useEffect, useState } from "react";

import { useMoralisCloudFunction } from "react-moralis";

import "./admin.scss"
import { IReduxState } from 'src/store/slices/state.interface';
import { useDispatch, useSelector } from 'react-redux';
import { shorten, trim } from 'src/helpers';
import { useWeb3Context } from 'src/hooks';

interface Data {
  id: number;
  address: string;
  nickname: string;
  score: number;
  amount: number;
}

type TxHistory = {
  id: string;
  txHash: string;
  block_number: number;
  date: number;
  amount: number;
  from: string;
  to: string;
}





function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'id',
  },
  {
    id: 'address',
    numeric: false,
    disablePadding: false,
    label: 'address',
  },
  {
    id: 'nickname',
    numeric: false,
    disablePadding: false,
    label: 'nickname',
  },
  {
    id: 'score',
    numeric: false,
    disablePadding: false,
    label: 'score',
  },
  {
    id: 'amount',
    numeric: true,
    disablePadding: false,
    label: 'amount',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  arrSelectedAddress:  Array<string>;
  arrAmount:  Array<number>;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected, arrSelectedAddress,arrAmount } = props;
  const [sum, setSum] = useState<number>(0);

  const spoilsofWar = useSelector<IReduxState, number>(state => state.app.spoilsofwar);

  const dispatch = useDispatch();

  const {chainID, provider} = useWeb3Context();

  useEffect(() => {
    let temp = 0;
    for (let i = 0; i < arrAmount.length; i++) {
      temp += arrAmount[i];
    }
    setSum(temp)
  
  }, [arrAmount])

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
      <>
        <Typography
          sx={{ flex: '0 1 auto', paddingLeft: '30px' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
        <Typography
          sx={{ flex: '0 1 auto', paddingLeft: '30px' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          Spoils of War Balance:{trim(spoilsofWar,5)} 
        </Typography>
        <Typography
          sx={{ flex: '0 1 auto', paddingLeft: '30px' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          Amount To Airdrop:{trim(sum,5)} 
        </Typography>

        <Button  className="airdrop-button" onClick={ async () => {
          if( sum == 0) return;
          dispatch(distributeRewards({arrAddress: arrSelectedAddress, arrAmount, networkID: chainID, provider}));
        }}>
          AirDrop
        </Button>
      </>
      ) : (
        <Typography
          sx={{ flex: '0 1 auto', paddingLeft: '10px' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Select Items That You Want To Airdrop (KAP - ONE)
        </Typography>
      )}
    </Toolbar>
  );
};

export default function AirdropTable() {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('amount');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState< string[]>([]);
  const [selectedAmount, setSelectedAmount] = React.useState< number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const lastAirdropTime = useSelector<IReduxState, number>(state => state.app.lastAirdropTime);
  const totalSupply = useSelector<IReduxState, number>(state => state.app.totalSupply);

  const [rows, setRows] = useState<Array<Data>>([]);

  const spoilsRewards = useSelector<IReduxState, number>(state => state.app.spoilsofwar);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];
    let arrAddressSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;



  const createTableData = () => {

    let rows = [];

    for (let i = 0; i < holders.length; i++) {

      let txsToLastAirdop: Array<TxHistory> | undefined = txHistory?.filter(tx => (tx.date <= lastAirdropTime) && (tx.from == holders[i] || tx.to == holders[i]));
      let balanceInLastAirdop = 0;

      if (txsToLastAirdop !== undefined) {
        for (let j = 0; j < txsToLastAirdop.length; j++) {
          if (txsToLastAirdop[j].to == holders[i]?.toLocaleLowerCase())
            balanceInLastAirdop += txsToLastAirdop[j].amount;
          else balanceInLastAirdop -= txsToLastAirdop[j].amount;
        }
      }


      let txsFromLastAirdrop: Array<TxHistory> | undefined = txHistory?.filter(tx => tx.date > lastAirdropTime && (tx.from == holders[i] || tx.to == holders[i]));

      txsFromLastAirdrop?.sort((a, b) => {
        return a.date - b.date;
      });

      const xDate: Array<number> = [];

      for (let i = 0; ; i++) {
        let timestamp = lastAirdropTime - lastAirdropTime % 86400000 + 86400000 * i;
        if (timestamp >= Date.now()) {
          xDate.push(Date.now());
        } else {
          xDate.push(timestamp);
        }
        if (timestamp >= Date.now())
          break;
      }

      let amount: number = 0;
      let lastTime = lastAirdropTime;
      let lastBalance = balanceInLastAirdop;
      let totalAmount: number = 0;
      let userRewards: number = 0;
      let score: number = 0;

      for (let i = 1; i < xDate.length; i++) {

        amount = 0;

        if (txsFromLastAirdrop !== undefined) {
          for (const tx of txsFromLastAirdrop) {
            if (tx.date >= xDate[i]) {
              break;
            }
            if (xDate[i] > tx.date && tx.date >= xDate[i - 1]) {
              if (tx.from === holders[i]?.toLocaleLowerCase()) {
                amount += lastBalance * (tx.date - lastTime) / 86400000;
                lastBalance -= tx.amount;
                lastTime = tx.date;
              } else {
                amount += lastBalance * (tx.date - lastTime) / 86400000;
                lastBalance += tx.amount;
                lastTime = tx.date;
              }
            }
          }
        }
        amount += lastBalance * (xDate[i] - lastTime) / 86400000;

        totalAmount += amount;
        lastTime = xDate[i];


      }

      userRewards = spoilsRewards * totalAmount / (30 * totalSupply);
      score = totalAmount / (30 * totalSupply);

      rows.push({ id: (i + 1), address: holders[i], nickname: "", score, amount: userRewards });

      setRows(rows);

    }
  }

  const { fetch } = useMoralisCloudFunction("getTokenHolders", { autoFetch: false });

  const filterTx = new Moralis.Query("TransferEventLogs");
  filterTx.notEqualTo("value", "0");

  const { data, isLoading, error } = useMoralisQuery("TransferEventLogs", query => filterTx);

  const [holders, setHolders] = useState<Array<string>>([]);

  const [txHistory, setTxHistory] = useState<Array<any>>([]);

  const cloudCall = () => {
    fetch({
      onSuccess: (data) => {
        setHolders(data as Array<string>);
      }
    });
  }

  useEffect(() => {

    cloudCall();
    let txHistory: TxHistory[] = [];
    if (!isLoading) {
      for (let i = 0; i <= data.length; i++) {
        if (data[i] !== undefined) {
          txHistory.push({
            id: data[i].get("objectId"),
            txHash: (data[i].get("transaction_hash")),
            block_number: data[i].get("block_number"),
            date: Date.parse(data[i].get("block_timestamp")),
            amount: Number(data[i].get("value")) / Math.pow(10, 9),
            from: data[i].get("from"),
            to: data[i].get("to"),
          });
        }
      }
      setTxHistory(txHistory);
    }
  }, [data]);

  useEffect(() => {
    if (txHistory != undefined && holders.length > 0)
      createTableData();
  }, [txHistory, holders]);

  const handleTableChange = (rowIndex: number, value: string) => {
    let tempRows = JSON.parse(JSON.stringify(rows));
    tempRows[rowIndex].amount = parseFloat(value);
    setRows(tempRows);
  }

  useEffect(() => {
    let selectedAddress = [];
    let selectedAmount = [];

    for(let i = 0; i < selected.length; i++) {
      if( rows != undefined) {
        selectedAddress.push(rows[selected[i] -1].address);
        selectedAmount.push(rows[selected[i] -1].amount);      
      }
    }

    setSelectedAddress(selectedAddress);
    setSelectedAmount(selectedAmount);
  },[selected, rows])

  return (
    <div className='admin-page'>
      <Box sx={{ width: '100%', height: "100%" }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Account Per Page"
          sx={{ display: 'flex', marginBottom: "20px" }}
        />
        <Paper sx={{ width: '100%', mb: 2, height: "90%", overflow: "auto" }}>
          <EnhancedTableToolbar numSelected={selected.length} arrSelectedAddress={selectedAddress} arrAmount={selectedAmount} />
          <TableContainer sx={{width: '100%'}}>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={'medium'}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          align='center'
                        >
                          {row.id}
                        </TableCell>
                        <TableCell align="center">{shorten(row.address)}</TableCell>
                        <TableCell align="center">{row.nickname}</TableCell>
                        <TableCell align="center">{trim(row.score, 5)}</TableCell>
                        <TableCell align="center">
                          <input type='number' value={trim(row.amount, 5)} onChange={(e) => handleTableChange(index, e.target.value)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </Paper>

      </Box>
    </div>
  );
}
