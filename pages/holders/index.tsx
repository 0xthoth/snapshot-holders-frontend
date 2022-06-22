import React, { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  // GridValueGetterParams,
  GridToolbar,
} from "@mui/x-data-grid";
import styled from 'styled-components';
import { Box, Grid, Container, Chip } from "@mui/material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// import dayjs from "dayjs";
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useStake66HoldersInfo } from "hooks/holder";
import { numberFormat, currencyFormatter } from "helpers";
import { ethers } from "ethers";


const total_columns: GridColDef[] = [
  { field: "address", headerName: "Address", valueFormatter: ({ value }) => ethers.utils.getAddress(value), width: 400 },
  { field: "balance", headerName: "Balance", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 150, align: "right" },
  { field: "balanceToTEM", headerName: "Balance To TEM", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 200, align: "right" },
  { field: "balanceTEMValue", headerName: "Balance TEM Value", valueFormatter: ({ value }) => currencyFormatter.format(Number(value)), width: 200, align: "right" },
  {
    field: "chain", headerName: "Chains", width: 190, renderCell: ({ value }) => {
      return value.map((c: any) => {
        if (c === 56) return <Chip color="warning" size="small" label="BSC" sx={{ mx: .4 }} />;
        if (c === 1285) return <Chip color="info" size="small" label="MOVR" sx={{ mx: .4 }} />;
        return <Chip color="success" size="small" label="ONE" sx={{ mx: .4 }} />;
      })
    }, align: "left"
  }
];
const columns: GridColDef[] = [
  { field: "address", headerName: "Address", valueFormatter: ({ value }) => ethers.utils.getAddress(value), width: 400 },
  { field: "balance", headerName: "Balance", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 150, align: "right" },
  { field: "balanceToTEM", headerName: "Balance To TEM", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 200, align: "right" },
  { field: "balanceTEMValue", headerName: "Balance TEM Value", valueFormatter: ({ value }) => currencyFormatter.format(Number(value)), width: 200, align: "right" },
  { field: "boost", headerName: "Boost", width: 80, align: "right" },
  { field: "stakedBlock", headerName: "Staked Block", width: 150, align: "right" },
  { field: "reward", headerName: "Reward", width: 150, valueFormatter: ({ value }) => numberFormat.format(Number(value)), align: "right" },
];

const TabStyle = styled(Tab)`
  && {
    font-weight: bold;
    font-size: 1.2rem;
  }
`;


const Holders = () => {
  const [value, setValue] = useState('all');
  const [totalType, setTotalType] = useState<'balance' | 'balanceToTEM' | 'balanceTEMValue'>('balanceToTEM');

  const handleTotalTypeChange = (event: SelectChangeEvent) => {
    setTotalType(event.target.value as 'balance' | 'balanceToTEM' | 'balanceTEMValue');
  };


  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const holders = useStake66HoldersInfo();

  const balances = useMemo((): {
    totalBalance: number,
    bscBalance: number,
    movrBalance: number,
    oneBalance: number,
    result: any[]
  } => {
    if (!holders[56] && !holders[1285]) return {
      totalBalance: 0,
      bscBalance: 0,
      movrBalance: 0,
      oneBalance: 0,
      result: []
    }

    const bscBalance = holders[56].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const movrBalance = holders[1285].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const oneBalance = holders[1666600000].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const totalBalance = bscBalance + movrBalance + oneBalance;

    const result = Object.values([...holders[56], ...holders[1285], ...holders[1666600000]].reduce((acc, { id, balance, balanceTEMValue, balanceToTEM, networkId, address }) => {
      acc[id] = {
        id,
        address,
        balance: (acc[id] ? acc[id].balance : 0) + +balance,
        balanceTEMValue: (acc[id] ? acc[id].balanceTEMValue : 0) + +balanceTEMValue,
        balanceToTEM: (acc[id] ? acc[id].balanceToTEM : 0) + +balanceToTEM,
        chain: acc[id]?.chain ? [...acc[id].chain, networkId] : [networkId]
      };
      return acc;
    }, {}));

    return {
      bscBalance,
      movrBalance,
      totalBalance,
      oneBalance,
      result
    }
  }, [holders, totalType])

  const isLoading = !balances.totalBalance;

  return (
    <Container maxWidth="xl" sx={{
      py: 10
    }}>
      <Typography component="div" variant="h3" color="#7d0707" fontWeight="bold">
        Stake66 Holders.
      </Typography>
      <Grid container spacing={5} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={12} md={12}>
          <Box sx={{ minWidth: 120, maxWidth: 250 }}>
            <FormControl fullWidth>
              <InputLabel id="total-by-label">Total By </InputLabel>
              <Select
                labelId="total-by-label"
                id="total-by"
                value={totalType}
                label="Total By"
                onChange={handleTotalTypeChange}
              >
                <MenuItem value="balanceToTEM">Balance To TEM</MenuItem>
                <MenuItem value="balanceTEMValue">Balance TEM Value</MenuItem>
                <MenuItem value="balance">Balance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>Total Balance</Box>
          <Typography component="div" variant="h3" color="#7d0707" fontWeight="bold" id="totalBalance">
            {!balances.totalBalance ? <Skeleton /> : numberFormat.format(Number(balances.totalBalance))}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>BSC Balance</Box>
          <Typography component="div" variant="h3" id="bscBalance">
            {!balances.bscBalance ? <Skeleton /> : numberFormat.format(Number(balances.bscBalance))}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>MOVR Balance</Box>
          <Typography component="div" variant="h3" id="movrBalance">
            {!balances.movrBalance ? <Skeleton /> : numberFormat.format(Number(balances.movrBalance))}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>ONE Balance</Box>
          <Typography component="div" variant="h3" id="oneBalance">
            {!balances.oneBalance ? <Skeleton /> : numberFormat.format(Number(balances.oneBalance))}
          </Typography>
        </Grid>
      </Grid>

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <TabStyle label="All" value="all" />
            <TabStyle label="BSC" value="56" />
            <TabStyle label="Moonriver" value="1285" />
            <TabStyle label="Harmony" value="1666600000" />
          </TabList>
        </Box>

        <TabPanel value="all">
          <strong>{balances.result.length} holders.</strong>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              loading={isLoading}
              rows={balances.result ?? []}
              columns={total_columns}
              pageSize={100}
              rowsPerPageOptions={[100]}
              components={{
                Toolbar: (data) => <GridToolbar {...data} csvOptions={{
                  fileName: 'Total All Chains'
                }} />
              }}
              isRowSelectable={() => false}
            />
          </div>
        </TabPanel>
        <TabPanel value="56">
          <strong>{holders[56]?.length} holders.</strong>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              loading={isLoading}
              rows={holders[56] ?? []}
              columns={columns}
              pageSize={100}
              rowsPerPageOptions={[100]}
              components={{
                Toolbar: (data) => <GridToolbar {...data} csvOptions={{
                  fileName: 'BSC Holders'
                }} />
              }}
              isRowSelectable={() => false}
            />
          </div>
        </TabPanel>
        <TabPanel value="1285">
          <strong>{holders[1285]?.length} holders.</strong>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              loading={isLoading}
              rows={holders[1285] ?? []}
              columns={columns}
              pageSize={100}
              rowsPerPageOptions={[100]}
              components={{
                Toolbar: (data) => <GridToolbar {...data} csvOptions={{
                  fileName: 'Moonriver Holders'
                }} />
              }}
              isRowSelectable={() => false}
            />
          </div>
        </TabPanel>
        <TabPanel value="1666600000">
          <strong>{holders[1666600000]?.length} holders.</strong>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              loading={isLoading}
              rows={holders[1666600000] ?? []}
              columns={columns}
              pageSize={100}
              rowsPerPageOptions={[100]}
              components={{
                Toolbar: (data) => <GridToolbar {...data} csvOptions={{
                  fileName: 'Harmony Holders'
                }} />
              }}
              isRowSelectable={() => false}
            />
          </div>
        </TabPanel>
      </TabContext>

    </Container>
  );
};

export default Holders;
