/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import { io } from "socket.io-client";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

interface IMsgDataTypes {
  roomId: string | number;
  user: string;
  msg: string;
  time: string;
}

export function Dashboard() {
  const { publicKey } = useWallet();

  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();
  const [showSpinner, setShowSpinner] = useState(false);
  const [roomId, setroomId] = useState("1");
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<IMsgDataTypes[]>([]);
  const socket = useMemo(() => io("http://localhost:3001"), []);

  useEffect(() => {
    socket.on("receive_msg", (data: IMsgDataTypes) => {
      setChat((pre) => [...pre, data]);
    });
  }, [socket]);

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMsg !== "" && userName) {
      const msgData: IMsgDataTypes = {
        roomId,
        user: userName,
        msg: currentMsg,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_msg", msgData);
      setCurrentMsg("");
    }
  };

  useEffect(() => {
    if (publicKey) {
      setUserName(publicKey.toBase58());
      socket.emit("join_room", roomId);
      return;
    }
    setUserName(undefined);
    socket.disconnect();
  }, [publicKey, roomId, socket]);

  useEffect(() => {
    console.log("CHAT: ", chat);
  }, [chat]);

  return (
    <div className="grid justify-center align-middle" suppressHydrationWarning>
      <main className="grid flex-1 gap-4 p-4">
        <div className="relative flex h-[700px] w-[400px] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
          <Badge variant="outline" className="absolute right-3 top-3">
            Sniff
          </Badge>
          {/* Content */}
          <div className="flex-1">
            <div className="h-full space-y-4 overflow-y-auto p-4">
              {chat.map(({ roomId, user, msg, time }) => {
                const isUser = user === userName;
                return isUser ? (
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[70%] rounded-lg bg-primary p-3 text-primary-foreground">
                      <p>{msg}</p>
                      <div className="mt-1 text-xs text-primary-foreground/80">
                        {time}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user.slice(0, 2)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {user}
                    </div>
                    <div className="max-w-[70%] rounded-lg bg-muted p-3">
                      <p>{msg}</p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send form */}
          <form
            className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            x-chunk="dashboard-03-chunk-1"
            onSubmit={(e) => sendData(e)}
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              onChange={(e) => setCurrentMsg(e.target.value)}
            />
            <div className="flex items-center p-3 pt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-not-allowed"
                    >
                      <Paperclip className="size-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach File</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-not-allowed"
                    >
                      <Mic className="size-4" />
                      <span className="sr-only">Use Microphone</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Use Microphone</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5 bg-white"
              >
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
