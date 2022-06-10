import React from "react";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import Layout from "@/components/Layout";
import { useStake66HoldersInfo } from "hooks/holder";
import { useWeb3Context } from "hooks";

const columns: GridColDef[] = [
  { field: "address", headerName: "Id", width: 400 },
  { field: "balance", headerName: "Balance", width: 200 },
  { field: "balanceToTEM", headerName: "balanceToTEM", width: 200 },
  { field: "balanceTEMValue", headerName: "balanceTEMValue", width: 200 },
  { field: "boost", headerName: "Boost", width: 100 },
  { field: "stakedBlock", headerName: "Staked Block", width: 200 },
  { field: "reward", headerName: "Reward", width: 200 },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 200,
    valueGetter: (params: GridValueGetterParams) =>
      `${dayjs.unix(params.row.updatedAt)}`,
  },
];

const Holders = () => {
  const { networkId, provider } = useWeb3Context();
  const holders = useStake66HoldersInfo(provider, networkId);

  return (
    <Layout>
      Holders:
      <Box>
        <div style={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={holders ?? []}
            columns={columns}
            pageSize={100}
            rowsPerPageOptions={[100]}
            components={{ Toolbar: GridToolbar }}
          />
        </div>
      </Box>
    </Layout>
  );
};

export default Holders;
