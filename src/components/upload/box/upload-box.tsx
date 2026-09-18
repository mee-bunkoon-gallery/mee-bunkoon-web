import type { UploadProps } from '../types';

import { useDropzone } from 'react-dropzone';
import { mergeClasses } from 'minimal-shared/utils';
import { RiUploadCloud2Fill } from '@remixicon/react';

import { UploadArea } from './styles';
import { uploadClasses } from '../classes';

// ----------------------------------------------------------------------

export function UploadBox({
  sx,
  error,
  disabled,
  className,
  placeholder,
  ...dropzoneOptions
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...dropzoneOptions,
  });

  const hasError = isDragReject || !!error;

  return (
    <UploadArea
      {...getRootProps()}
      className={mergeClasses([uploadClasses.box, className], {
        [uploadClasses.state.dragActive]: isDragActive,
        [uploadClasses.state.disabled]: disabled,
        [uploadClasses.state.error]: hasError,
      })}
      sx={sx}
    >
      <input {...getInputProps()} />
      {placeholder ?? <RiUploadCloud2Fill size={28} />}
    </UploadArea>
  );
}
