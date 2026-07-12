import React, { useState } from 'react';
import { Eye, Loader2, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface CertificateViewerProps {
  pdfUrl: string;
  certificateId: string;
}

export function CertificateViewer({ pdfUrl, certificateId }: CertificateViewerProps) {
  const [loading, setLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1c2624] border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-[#dbf0de]" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Certificate Preview — {certificateId}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase">
          <ShieldCheck size={12} /> SECURE CRYPTO-SIGNATURE
        </div>
      </div>

      {/* PDF Interactive Frame Container */}
      <div className="relative aspect-[1.414/1] w-full bg-black/40 rounded-2xl overflow-hidden border border-white/5">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c2624]/90 z-10 space-y-3">
            <Loader2 className="w-8 h-8 text-[#dbf0de] animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Loading high-resolution certificate...</p>
          </div>
        )}

        {/* PDF Iframe (Uses standard browser PDF renderer) */}
        <iframe
          src={`/api/certificates/download?id=${certificateId}&view=true#toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          title={`Certificate Preview: ${certificateId}`}
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
        <p>If the preview doesn&apos;t load automatically, use the buttons below.</p>
        <div className="flex items-center gap-3">
          <a
            href={`/api/certificates/download?id=${certificateId}&view=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-300 hover:text-[#dbf0de] transition-colors"
          >
            <ExternalLink size={13} /> Open full size
          </a>
          <span>|</span>
          <a
            href={`/api/certificates/download?id=${certificateId}`}
            download={`${certificateId}.pdf`}
            className="flex items-center gap-1.5 text-gray-300 hover:text-[#dbf0de] transition-colors"
          >
            <Download size={13} /> Direct Download
          </a>
        </div>
      </div>
    </motion.div>
  );
}
