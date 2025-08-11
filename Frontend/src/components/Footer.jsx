import { Box, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        backgroundColor: 'background.paper',
        textAlign: 'center',
      }}
    >
      <Box
        component="a"
        href="https://www.instagram.com/enitio_ntu/"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.6,
          textDecoration:'none'
          
        }}
      >
        <InstagramIcon fontSize="small" color="secondary" />
        <Typography variant="body2" color="text.secondary">
          ENITIO-2025
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
