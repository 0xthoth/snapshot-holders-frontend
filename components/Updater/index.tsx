import { useEffect } from "react";
import { useWeb3Context } from "hooks";
import { fetchWhitelistInfo, fetchNostoBalance } from "state/app/appSlice";
import { useAppDispatch } from "state/hooks";

const Updater = () => {
  const dispatch = useAppDispatch();

  const { provider, address } = useWeb3Context();

  useEffect(() => {
    if (provider) {
      dispatch(
        fetchWhitelistInfo({
          provider,
        })
      );
    }

    if (provider && address) {
      dispatch(
        fetchNostoBalance({
          provider,
          address,
        })
      );
    }
  }, [provider, address]);

  return null;
};

export default Updater;
