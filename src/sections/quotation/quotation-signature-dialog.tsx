'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';

import { saveQuotationSignature } from './quotation-api';

type Props = {
  open: boolean;
  quotationId: string;
  signer: 'issuer' | 'customer' | null;
  onClose: () => void;
  onSigned: (signatureUrl: string) => void;
};

export function QuotationSignatureDialog({ open, quotationId, signer, onClose, onSigned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#1C252E';
    context.lineWidth = 3;
    context.lineCap = 'round';
    setHasSignature(false);
  }, [open]);

  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * event.currentTarget.width) / rect.width,
      y: ((event.clientY - rect.top) * event.currentTarget.height) / rect.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const point = getPosition(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const point = getPosition(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasSignature(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const save = async () => {
    if (!canvasRef.current || !signer || !hasSignature) return;
    try {
      const signatureUrl = await saveQuotationSignature(
        quotationId,
        signer,
        canvasRef.current.toDataURL('image/png')
      );
      onSigned(signatureUrl);
      toast.success('บันทึกลายมือชื่อแล้ว');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'บันทึกลายมือชื่อไม่สำเร็จ');
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>{signer === 'issuer' ? 'ลงชื่อผู้เสนอราคา' : 'ลงชื่อผู้รับข้อเสนอ'}</DialogTitle>
      <DialogContent>
        <Box
          component="canvas"
          ref={canvasRef}
          width={900}
          height={300}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={() => setDrawing(false)}
          onPointerLeave={() => setDrawing(false)}
          sx={{
            mt: 1,
            width: 1,
            height: 200,
            touchAction: 'none',
            cursor: 'crosshair',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={clear}>
          ล้าง
        </Button>
        <Button color="inherit" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="contained" disabled={!hasSignature} onClick={save}>
          บันทึกลายมือชื่อ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
