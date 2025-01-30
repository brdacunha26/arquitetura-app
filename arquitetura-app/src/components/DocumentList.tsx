'use client';

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useState } from 'react';

type Document = {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'DOC' | 'DWG' | 'OTHER';
  uploadedAt?: Date;
  size?: number;
  uploadedBy?: string;
};

const documentIcons = {
  PDF: <PdfIcon color="error" />,
  IMAGE: <ImageIcon color="primary" />,
  DOC: <DocumentIcon color="info" />,
  DWG: <FileIcon color="success" />,
  OTHER: <FileIcon />,
};

interface DocumentListProps {
  documents: Document[];
  onEditDocument?: (documentId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
  onDownloadDocument?: (documentId: string) => void;
}

export default function DocumentList({
  documents,
  onEditDocument,
  onDeleteDocument,
  onDownloadDocument,
}: DocumentListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDocument(documentId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDocument(null);
  };

  const handleEdit = () => {
    if (selectedDocument && onEditDocument) {
      onEditDocument(selectedDocument);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDocument && onDeleteDocument) {
      onDeleteDocument(selectedDocument);
    }
    handleMenuClose();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <List>
      {documents.map((document) => (
        <ListItem
          key={document.id}
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>{documentIcons[document.type]}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{document.name}</Typography>
                <Chip
                  label={document.type}
                  size="small"
                  sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                {document.uploadedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Enviado em: {document.uploadedAt.toLocaleDateString()}
                    {document.uploadedBy && ` por ${document.uploadedBy}`}
                  </Typography>
                )}
                {document.size && (
                  <Typography variant="body2" color="text.secondary">
                    Tamanho: {formatFileSize(document.size)}
                  </Typography>
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => onDownloadDocument?.(document.id)}
              sx={{ mr: 1 }}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton edge="end" onClick={(e) => handleMenuOpen(e, document.id)}>
              <MoreIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </List>
  );
} 