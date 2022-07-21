import React, { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  // GridValueGetterParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Grid, Container } from "@mui/material";
import Typography from '@mui/material/Typography';
import { useStake66V2HoldersInfo } from "hooks/holder";
import { numberFormat, currencyFormatter } from "helpers";
import { ethers } from "ethers";

const columns: GridColDef[] = [
  { field: "address", headerName: "Address", valueFormatter: ({ value }) => ethers.utils.getAddress(value), width: 400 },
  { field: "balance", headerName: "Balance", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 150, align: "right" },
  { field: "balanceTEMValue", headerName: "Value", valueFormatter: ({ value }) => currencyFormatter.format(Number(value)), width: 200, align: "right" },
  { field: "boost", headerName: "Boost", width: 80, align: "right" },
  {
    field: "reward", headerName: "Reward", width: 150, valueFormatter: ({ value }) => numberFormat.format(Number(value)), align: "right"
  },
  { field: "rewardx", headerName: "Reward * X", valueFormatter: ({ value }) => numberFormat.format(Number(value)), width: 200, align: "right" },
  { field: "stakedBlock", headerName: "Staked Block", width: 150, align: "right" },
];

const Holders = () => {
  const holders = useStake66V2HoldersInfo();

  const balances = useMemo((): {
    totalBalance: number,
    totalRewardX: number,
  } => {
    if (!holders[56] && !holders[1285]) return {
      totalBalance: 0,
      totalRewardX: 0
    }

    let totalBalance = 0,
      totalRewardX = 0;


    holders.map((v) => {
      totalBalance += +v.balance;
      totalRewardX += +v.rewardx
    })

    return {
      totalBalance,
      totalRewardX
    }
  }, [holders])


  return (
    <Container maxWidth="xl" sx={{
      py: 10
    }}>
      <Typography component="div" variant="h3" color="#7d0707" fontWeight="bold">
        Stake66-V2 Holders.
      </Typography>
      <div>
        <span>{holders.length} holders.</span> | <span>Total Balance: {balances.totalBalance} | Total Reward * X: {balances.totalRewardX}</span>
      </div>
      <Grid container spacing={5} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={12} md={12}>
          <div style={{ height: 1200, width: "100%" }}>
            <DataGrid
              loading={holders?.length === 0}
              rows={holders ?? []}
              columns={columns}
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
        </Grid>

      </Grid>
    </Container>
  );
};

export default Holders;
