"use client";

import { Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button variant="outline" size="sm" onClick={() => copy(url)}>
      {copied ? (
        <>
          <Check className="mr-1 h-4 w-4" /> Copied
        </>
      ) : (
        <>
          <Link className="mr-1 h-4 w-4" /> Copy Link
        </>
      )}
    </Button>
  );
}
