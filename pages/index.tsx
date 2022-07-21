import type { NextPage } from "next";

import Holders from "./holders";
import HoldersV2 from './holdersv2'

const Home: NextPage = () => {
  return (
    <HoldersV2 />
  );
};

export default Home;
