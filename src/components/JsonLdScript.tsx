import React from "react";

interface JsonLdScriptProps {
  data: Record<string, any>;
  id?: string;
}

export default function JsonLdScript({ data, id }: JsonLdScriptProps) {
  if (!data) return null;

  return (
    <script
      id={id || `json-ld-${Math.random().toString(36).substring(2, 9)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
