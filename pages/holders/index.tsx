import React, { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  // GridValueGetterParams,
  GridToolbar,
} from "@mui/x-data-grid";
import styled from 'styled-components';
import { Box, Grid, Container } from "@mui/material";
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


const columns: GridColDef[] = [
  { field: "address", headerName: "Address", width: 400 },
  { field: "balance", headerName: "Balance", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 150, align: "right" },
  { field: "balanceToTEM", headerName: "Balance To TEM", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 200, align: "right" },
  { field: "balanceTEMValue", headerName: "Balance TEM Value", valueFormatter: ({ value }) => currencyFormatter.format(Number(value)), width: 200, align: "right" },
  { field: "boost", headerName: "Boost", width: 80, align: "right" },
  { field: "stakedBlock", headerName: "Staked Block", width: 150, align: "right" },
  { field: "reward", headerName: "Reward", width: 150, valueFormatter: ({ value }) => numberFormat.format(Number(value)), align: "right" },
  {
    field: "chains", headerName: "Chains", width: 150, valueFormatter: ({ value }) => value.filter((v: any) => v !== undefined).toString(), align: "left"
  },
];

const TabStyle = styled(Tab)`
  && {
    font-weight: bold;
    font-size: 1.2rem;
  }
`;


const Holders = () => {
  const [value, setValue] = useState('1');
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
    oneBalance: number
  } => {
    if (!holders[56] && !holders[1285]) return {
      totalBalance: 0,
      bscBalance: 0,
      movrBalance: 0,
      oneBalance: 0
    }

    const bscBalance = holders[56].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const movrBalance = holders[1285].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const oneBalance = holders[1666600000].reduce((preValue, curValue) => +preValue + +curValue[totalType], 0);
    const totalBalance = bscBalance + movrBalance + oneBalance;

    console.log(holders);

    return {
      bscBalance,
      movrBalance,
      totalBalance,
      oneBalance
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
            <TabStyle label="BSC" value="1" />
            <TabStyle label="Moonriver" value="2" />
            <TabStyle label="Harmony" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <strong>{holders[56]?.length} holders.</strong>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              onCellClick={(v) => console.log(v)}
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
        <TabPanel value="2">
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
        <TabPanel value="3">
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
