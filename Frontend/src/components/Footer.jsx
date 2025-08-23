import { Box, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

const INSTA_URL = import.meta.env.VITE_INSTA_URL;
const INSTA_TEXT = import.meta.env.VITE_INSTA_TEXT;

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        backgroundColor: 'background.paper',
        textAlign: 'center',
        display:'flex',
        flexDirection:'row',
        justifyContent: 'center',
        gap:'2rem'
      }}
    >
      <Box
        component="a"
        href={"https://www.github.com/DevFalkon"}
        target='_blank'
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.6,
          textDecoration:'none'
        }}>
        <GitHubIcon fontSize="small" color="primary" />
        <Typography variant="body2" color="text.secondary">
          {"GitHub"}
        </Typography>
      </Box>

      <Box
        component="a"
        href={INSTA_URL}
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
          {INSTA_TEXT}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
