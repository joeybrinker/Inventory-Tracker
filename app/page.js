'use client'
import * as React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import { Box, Stack, Typography, Button, Modal, TextField, Tabs, Tab } from '@mui/material';
import { firestore } from './firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Home() {

  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');


  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState(null);
  const camera = useRef(null);

  //update inventory
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  //useEffect
  useEffect(() => {
    updateInventory();
  }, []);

  //add item
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  //remove item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  //open and close modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //take photo
  const takePhoto = () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setImage(photo);
      setShowCamera(false);
    }
  };

  //toggle camera
  const toggleCamera = () => {
    setImage(null);
    setShowCamera(!showCamera);
  };

  return (
    <Box
    
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
          
        </Box>
      </Modal>
      
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Add Item" {...a11yProps(0)} />
          <Tab label="Camera" {...a11yProps(1)} />
        </Tabs>

      <CustomTabPanel value={value} index={0}>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <Box justifyContent={'center'} alignItems={'center'}>
          <Button variant="contained" onClick={toggleCamera}>
            {showCamera ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
            {showCamera && (
          <Box 
            mt={2} 
            sx={{ 
              width: '50vw',  // 50% of the viewport width
              height: '50vw', // height equals width to make it square
              maxWidth: '400px',  // Set a maximum size if needed
              maxHeight: '400px', // Ensure the height also maxes out at 400px
              position: 'relative', 
              overflow: 'hidden' 
            }}
          >
            <Camera 
              ref={camera} 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}/>
              <Button 
                variant="contained" 
                onClick={takePhoto}  
                sx={{
                  position: 'absolute',
                  bottom: '10px', // Distance from the bottom of the camera
                  left: '50%', // Position at the middle horizontally
                  transform: 'translateX(-50%)', // Center it by moving left 50% of its width
                }}>
                Take Photo
              </Button>
          </Box>
          
          )}
          {image && (
            <Box mt={2}>
              <img src={image} alt="Captured" width="100%" style={{transform: 'scaleX(-1)'}}/>
              
              
            </Box>
          )}
        </Box>
      </CustomTabPanel>

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
