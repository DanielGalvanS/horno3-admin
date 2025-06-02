import Link from "next/link";
import { styled, Box, Typography } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  textDecoration: "none",
  borderBottom: "1px solid #e0e0e0",
  marginBottom: "16px",
  gap: "8px",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#E17055', 
          fontWeight: 600,
          fontSize: '24px',
          textAlign: 'center'
        }}
      >
        MUSEO HORNO3
      </Typography>
    </LinkStyled>
  );
};

export default Logo;