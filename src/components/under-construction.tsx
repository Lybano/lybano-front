"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UnderConstruction() {
  const [isVisibleText, setIsVisibleText] = useState<boolean>(false);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {isVisibleText && (
        <h1 className="font-bold text-2xl">under construction... :)</h1>
      )}
      <Button onClick={() => setIsVisibleText(!isVisibleText)}>
        click here
      </Button>
    </div>
  );
}
