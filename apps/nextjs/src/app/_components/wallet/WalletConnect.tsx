"use client";

import type { Adapter } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatAddress } from "utils/format-address";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

const WalletConnect = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { wallets, select, publicKey, wallet } = useWallet();

  const handleClick = (adapter: Adapter) => {
    select(adapter.name);
  };

  return (
    <div
      className="hidden w-[250px] flex-col items-start gap-8 pt-2 md:flex"
      x-chunk="dashboard-03-chunk-0"
      suppressHydrationWarning
    >
      <form className="grid w-full items-start gap-6">
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Log In</legend>
          <div className="grid gap-3">
            <div className="flex w-full justify-between align-middle">
              <Badge variant="outline">Wallet</Badge>
              {publicKey && (
                <>
                  <Badge variant="secondary">
                    {formatAddress(publicKey.toBase58(), 4, 4)}
                  </Badge>
                </>
              )}
            </div>

            <Select
              onValueChange={(value) => {
                const selectedWallet = wallets.find(
                  (wallet) => wallet.adapter.name === value,
                );
                if (selectedWallet) {
                  handleClick(selectedWallet.adapter);
                }
              }}
              defaultValue={wallet?.adapter.name}
            >
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(({ adapter: { name, icon } }) => (
                  <SelectItem value={name}>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Avatar className="size-5">
                        <AvatarImage src={icon} />
                        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p>{name}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default WalletConnect;
