import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import MapPopup from '../components/AdminMap';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminPage = () => {
  const [items, setItems] = useState([]);
  const [urls, setUrls] = useState({});
  const [selectedFilename, setSelectedFilename] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editedPosition, setEditedPosition] = useState({ lat: null, lng: null });

  // API calls

  const get_awaited = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/awaiting_approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cedentials: 'include'
      });

      const data = await resp.json();
      
      if (resp.ok){
        setItems(data.files);
        return data.files;
      }
    }
    
    catch (err) {
      if (err.name === 'TypeError') {
          throw new Error('Unable to connect to server');
      } else {
          throw err;
      }
    }
  };

  const getPublicUrl = async (file_name) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/awaiting_approval_url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_name }),
      });

      const data = await resp.json();

      if (resp.ok){
        return data.url;
      }
    }
    
    catch (err) {
      if (err.name === 'TypeError') {
          throw new Error('Unable to connect to server');
      } else {
          throw err;
      }
    }
  };

  useEffect(() => {
    const fetchAwaitedUrls = async () => {
      try {
        const all_data = await get_awaited(); // your backend returns the array of items
        const newUrls = {};

        for (const item of all_data) {
          newUrls[item.filename] = await getPublicUrl(item.filename);
        }
        setSelectedFilename(all_data[0]?.filename || null);
        setUrls(newUrls); // store all URLs in state
      } catch (err) {
        console.error('Failed to fetch awaited URLs', err);
      }
    };
    setLoading(false);
    fetchAwaitedUrls();
  }, []);

  const selectedItem = items.find((item) => item.filename === selectedFilename);
  


  // 1. Handle image approval
  async function approveHandler(item) {
    const { filename, lat, lng } = item;

    const update_db = async (filename, lat, lng) => {
      try {
        const resp = await fetch(`${BACKEND_URL}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, lat, lng }),
        });

        if (resp.ok){
          console.log("updated database");
        }
      }
      
      catch (err) {
        if (err.name === 'TypeError') {
            throw new Error('Unable to connect to server');
        } else {
            throw err;
        }
      }
    };

    await update_db(filename, lat, lng);

    // Update UI
    setItems((prev) => {
      const updated = prev.filter((i) => i.filename !== filename);
      setSelectedFilename(updated[0]?.filename || null);
      return updated;
    });
  }

  // 2. Handle rejected images
  async function rejectHandler(item) {
    const { filename, lat, lng } = item;

    const update_db = async (filename) => {
      try {
        const resp = await fetch(`${BACKEND_URL}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename }),
        });

        if (resp.ok){
          console.log("updated database");
        }
      }
      
      catch (err) {
        if (err.name === 'TypeError') {
            throw new Error('Unable to connect to server');
        } else {
            throw err;
        }
      }
    };

    await update_db(filename);

    setItems((prev) => {
      const updated = prev.filter((i) => i.filename !== filename);
      setSelectedFilename(updated[0]?.filename || null);
      return updated;
    });
  }

  // Reset edited position and editing mode when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setEditedPosition({ lat: selectedItem.lat, lng: selectedItem.lng });
      setIsEditing(false);
    }
  }, [selectedItem]);

  // Called by MapPopup when user clicks map to select new location
  const handlePositionChange = ({ lat, lng }) => {
    if (isEditing) {
      setEditedPosition({ lat, lng });
    }
  };

  // Save edited location back to the items array
  const handleSave = () => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.filename === selectedFilename
          ? { ...item, lat: editedPosition.lat, lng: editedPosition.lng }
          : item
      )
    );
    setIsEditing(false);
  };

  // Cancel editing, revert to original lat/lng
  const handleCancel = () => {
    setEditedPosition({ lat: selectedItem.lat, lng: selectedItem.lng });
    setIsEditing(false);
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: List */}
      <Box sx={{ width: '33%', height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Images
        </Typography>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            gap: 2,
            scrollbarWidth: 'thin',
            scrollbarColor: '#2196f3 #1e1e1e',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#1e1e1e',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#2196f3',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#1976d2',
            },
          }}
        >
          {items.map((item) => (
            <Box
              key={item.filename}
              sx={{
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                bgcolor: item.filename === selectedFilename ? '#32495dff' : '#2c2c2c',
                p: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#32495dff' },
              }}
              onClick={() => setSelectedFilename(item.filename)}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="body1" noWrap>
                  {item.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.lat}, {item.lng}
                </Typography>
              </Box>

              <Box
                component="img"
                src={urls[item.filename]}
                alt={item.filename}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 1,
                  ml: 2,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel: Map and overlay */}
      <Box sx={{ width: '67%', p: 2 }}>
        {selectedItem ? (
          <Box sx={{ position: 'relative', height: '100%', borderRadius: '15px', overflow: 'hidden' }}>
            <MapPopup
              lat={editedPosition.lat}
              lng={editedPosition.lng}
              isEditing={isEditing}
              onPositionChange={handlePositionChange}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                p: 1,
                borderRadius: 2,
                maxWidth: 300,
                color: 'white',
                boxShadow: 3,
                zIndex: 1000,
              }}
            >
              <Box
                component="img"
                src={urls[selectedItem.filename]}
                alt={selectedItem.filename}
                sx={{ width: '100%', borderRadius: 1, mb: 1 }}
              />

              <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                {!isEditing ? (
                  <>
                    <Button variant="outlined" color="primary" fullWidth onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button variant="contained" color="success" fullWidth onClick={() => approveHandler(selectedItem)}>
                      Approve
                    </Button>
                    <Button variant="contained" color="error" fullWidth onClick={() => rejectHandler(selectedItem)}>
                      Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outlined" color="inherit" fullWidth onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography>No item selected.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminPage;
