import { FC, useRef, useState, useCallback } from 'react';

import { AnalysisStatus } from '@app-types/analysis';
import { Button } from '@ui/Button';
import { Loader } from '@ui/Loader';
import { Typography } from '@ui/Typography';
import { isCsvFile } from '@utils/analysis';
import cn from 'classnames';

import { FileDisplay } from '../FileDisplay';

import styles from './Dropzone.module.css';

type Props = {
    file: File | null;
    status: AnalysisStatus;
    error: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
};

export const Dropzone: FC<Props> = ({ file, status, error, onFileSelect, onClear }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const isProcessing = status === 'processing';

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isProcessing) {
                return;
            }

            setIsDragActive(true);
            setValidationError(null);
        },
        [isProcessing]
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        },
        []
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleFileSelect = (selectedFile: File) => {
        if (!isCsvFile(selectedFile)) {
            setValidationError('Можно загружать только *.csv файлы');
            return;
        }

        setValidationError(null);
        onFileSelect(selectedFile);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDragActive(false);

            if (isProcessing) {
                return;
            }

            const droppedFile = e.dataTransfer.files?.[0];

            if (droppedFile) {
                handleFileSelect(droppedFile);
            }
        },
        [isProcessing]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];

            if (selectedFile) {
                handleFileSelect(selectedFile);
                e.target.value = '';
            }
        },
        []
    );

    const handleUploadClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setValidationError(null);
        inputRef.current?.click();
    }, []);

    const handleZoneClick = useCallback(() => {
        if (!file && !isProcessing) {
            setValidationError(null);
            inputRef.current?.click();
        }
    }, [file, isProcessing]);

    const renderContent = () => {
        if (isProcessing) {
            return (
                <div className={styles.fileProcessing}>
                    <Loader />
                </div>
            );
        }

        if (file) {
            return (
                <FileDisplay
                    fileName={file.name}
                    onClear={onClear}
                    isCompleted={status === 'completed'}
                    isProcessing={isProcessing}
                />
            );
        }

        return (
            <Button type="button" variant="upload" onClick={handleUploadClick} disabled={isProcessing}>
                Загрузить файл
            </Button>
        );
    };

    const renderStatusText = () => {
        if (validationError) {
            return <Typography color="error" size="l" as="div">{validationError}</Typography>;
        }
        if (isProcessing) {
            return <Typography size="l" as="div">идёт парсинг файла</Typography>;
        }
        if (status === 'completed') {
            return <Typography size="l" as="div">готово!</Typography>;
        }
        if (error) {
            return <Typography color="error" size="l" as="div">{error}</Typography>;
        }
        if (file) {
            return <Typography size="l" as="div">файл загружен!</Typography>;
        }
        if (isDragActive) {
            return <Typography size="l" as="div">Отпустите для загрузки</Typography>;
        }
        return <Typography size="l" as="div">или перетащите сюда .csv файл</Typography>;
    };

    return (
        <div
            className={cn(styles.dropzone, {
                [styles.dragActive]: isDragActive,
                [styles.dragReject]: validationError,
            })}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleZoneClick}
            role="button"
            tabIndex={0}
        >
            <input data-testid="file-input" type="file" accept=".csv" ref={inputRef} onChange={handleInputChange} hidden />

            {renderContent()}

            {renderStatusText()}
        </div>
    );
};
