"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { render } from "@react-email/render";
import { NewsletterBase } from "@/lib/email/templates-views/newsletter-base";

interface EmailPreviewProps {
  template: string;
  data: any;
  trigger?: React.ReactNode;
}

export function EmailPreview({ template, data, trigger }: EmailPreviewProps) {
  // const [previewType, setPreviewType] = useState<"html" | "text">("html");
  const [currentEmailHtml, setCurrentEmailHtml] = useState<string | null>(null);
  const [isLoadingEmailHtml, setIsLoadingEmailHtml] = useState(false);

  const renderEmailHtml = async () => {
    try {
      const emailTemplate = NewsletterBase({
        ...data,
      });
      return await render(emailTemplate.html);
    } catch (error) {
      console.error("Error rendering email template:", error);
      return "<p>Error rendering email template</p>";
    }
  };

  // const renderEmailText = async () => {
  //   try {
  //     return await render(<NewsletterBase {...data} />, { plainText: true });
  //   } catch (error) {
  //     console.error("Error rendering email text:", error);
  //     return "Error rendering email template";
  //   }
  // };

  useEffect(() => {
    const fetchEmailHtml = async () => {
      setIsLoadingEmailHtml(true);
      const html = await renderEmailHtml();
      setCurrentEmailHtml(html);
      setIsLoadingEmailHtml(false);
    };
    fetchEmailHtml();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, data]);

  // useEffect(() => {
  //   const fetchEmailText = async () => {
  //     setIsLoadingEmailText(true);
  //     const text = await renderEmailText();
  //     setEmailText(text);
  //     setIsLoadingEmailText(false);
  //   };
  //   fetchEmailText();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [template, data]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            This is a preview of how your email will look when sent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Controls */}

          {/* Preview Tabs */}
          {/* <Tabs
            value={previewType}
            onValueChange={(value) => setPreviewType(value as "html" | "text")}
          >
            <TabsList>
              <TabsTrigger value="html">HTML Preview</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4"> */}
          <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
            <div
              className="mx-auto bg-white shadow-lg"
              style={{
                maxWidth: "100%",
                overflowY: "auto", // Allow vertical scrolling
                maxHeight: "70vh", // Match iframe height
              }}
            >
              {isLoadingEmailHtml ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading email preview...</p>
                </div>
              ) : (
                <iframe
                  srcDoc={currentEmailHtml || "<p>Error loading preview</p>"}
                  className="w-full border-0  h-[70vh] "
                  title="Email Preview"
                />
              )}
            </div>
          </div>
          {/* </TabsContent>

            <TabsContent value="text" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Plain Text Version</CardTitle>
                  <CardDescription>
                    This is how your email will appear in plain text email
                    clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full whitespace-pre-wrap text-sm p-4 rounded border max-h-96 overflow-auto"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                      wordBreak: "break-all", // Aggressively break long strings
                    }}
                  >
                    {isLoadingEmailText ? (
                      <p>Loading plain text preview...</p>
                    ) : (
                      emailText || "<p>Error loading preview</p>"
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
