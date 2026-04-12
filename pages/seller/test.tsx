import React, { useState, useEffect, useRef } from 'react';
import { 
 Container, Grid, Typography, Button, Paper, Box, 
 Divider, List, ListItem, ListItemText, Card, CardContent, SvgIcon, Avatar, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// --- Icons ---
const CallIcon = (props: any) => (
 <SvgIcon {...props}><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-3.52-1.11-3.52-1.11-3.52-2.34 0-.55-.45-1-1-1H3.5c-.55 0-1 .45-1 1C2.5 12.06 11.94 21.5 21.5 21.5c.55 0 1-.45 1-1v-4.12c0-.55-.45-1-1-1z"/></SvgIcon>
);
const VerifiedIcon = (props: any) => (
 <SvgIcon {...props} sx={{ color: '#1a73e8', fontSize: '1.2rem', ml: 1 }}>
 <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7l-3.61.81.34 3.7L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/>
 </SvgIcon>
);
const DownloadIcon = (props: any) => (
 <SvgIcon {...props}><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></SvgIcon>
);

const VendorStorefront = () => {
 const [mounted, setMounted] = useState(false);
 
 // 1. Create Refs for scrolling
 const aboutRef = useRef<HTMLDivElement>(null);
 const productsRef = useRef<HTMLDivElement>(null);
 const reachUsRef = useRef<HTMLDivElement>(null);
 const galleryRef = useRef<HTMLDivElement>(null);

 useEffect(() => { setMounted(true); }, []);

 // 2. Scroll Function
 const scrollToSection = (elementRef: React.RefObject<HTMLDivElement>) => {
 window.scrollTo({
 top: elementRef.current?.offsetTop ? elementRef.current.offsetTop - 20 : 0,
 behavior: 'smooth',
 });
 };

 if (!mounted) return null;

 const services = [
 { name: "Waterproofing Solution Services", price: "₹ 20 / sq ft", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300" },
 { name: "Epoxy Flooring Service", price: "₹ 100 / sq ft", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300" },
 { name: "Industrial Wall Painting", price: "₹ 30 / sq ft", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300" },
 { name: "APP Membrane Waterproofing", price: "₹ 1,500 / Roll", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300" }
 ];

 // Business stats and certifications
 const businessStats = [
 { label: 'Years in Business', value: '8+' },
 { label: 'Clients Served', value: '120+' },
 { label: 'Completed Projects', value: '350+' },
 { label: 'Certifications', value: 'ISO 9001:2015' },
 { label: 'Awards', value: 'Best Vendor 2023' },
 ];

 const theme = useTheme();
 return (
 <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', pb: 10 }}>
 {/* HEADER */}
 <Paper elevation={1} sx={{ borderBottom: `2px solid ${theme.palette.primary.main}`, py: 2, mb: 3, borderRadius: 0, background: theme.palette.background.paper }}>
 <Container maxWidth="lg">
 <Grid container alignItems="center" spacing={2}>
 <Grid item>
 <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontSize: '2rem', fontWeight: 'bold' }}>RS</Avatar>
 </Grid>
 <Grid item xs>
 {/* Top line: Name only */}
 <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main, mb: 0.5 }}>
 Right Solutions
 </Typography>
 {/* Second line: all info, rating */}
 <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
 <Chip label="TrustSEAL" size="small" sx={{ bgcolor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText, fontWeight: 'bold', height: 24 }} />
 <Chip label="GST: 19AAWFR2093L1ZA" size="small" sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.primary, fontWeight: 'bold', height: 24 }} />
 <Chip label="8 yrs" size="small" sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.primary, fontWeight: 'bold', height: 24 }} />
 <Chip label="71% Response rate" size="small" sx={{ bgcolor: theme.palette.background.default, color: theme.palette.success.main, fontWeight: 'bold', height: 24 }} />
 <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
 <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold', mr: 0.5 }}>★★★★★</Typography>
 <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>&nbsp;4.4 (93)</Typography>
 </Box>
 </Box>
 </Grid>
 <Grid item sx={{ minWidth: 200, textAlign: 'right' }}>
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
 <Button variant="contained" color="primary" startIcon={<CallIcon />} sx={{ fontWeight: 'bold', minWidth: 90, height: 32, px: 2, fontSize: 14 }} href="tel:08048261962">
 Mobile
 </Button>
 <Button variant="outlined" color="secondary" sx={{ fontWeight: 'bold', minWidth: 90, height: 32, px: 2, fontSize: 14 }} href="mailto:info@rightsolutions.com">
 Email
 </Button>
 </Box>
 </Grid>
 </Grid>
 </Container>
 </Paper>

 <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 2, md: 6 } }}>
 {/* BUSINESS STATS & CERTIFICATIONS */}
 <Grid container spacing={3} sx={{ mb: 4 }}>
 <Grid item xs={12}>
 <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Grid container spacing={2} alignItems="center" justifyContent="space-between">
 {businessStats.map((stat, idx) => (
 <Grid item xs={6} sm={4} md={2.4} key={idx}>
 <Box sx={{ textAlign: 'center', p: 1 }}>
 <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 0.5 }}>{stat.value}</Typography>
 <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
 </Box>
 </Grid>
 ))}
 </Grid>
 </Paper>
 </Grid>
 </Grid>
 <Grid container spacing={3}>

  
 {/* LEFT SIDEBAR WITH SCROLL LINKS */}
 <Grid item xs={12} md={3}>
 <Box sx={{ position: 'sticky', top: 32 }}>
 <Paper variant="outlined" sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: theme.palette.background.paper }}>
 <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold' }}>Our Company</Typography>
 <Divider />
 <List dense>
 <ListItem button onClick={() => scrollToSection(aboutRef)}><ListItemText primary="About Us" /></ListItem>
 <ListItem button onClick={() => scrollToSection(productsRef)}><ListItemText primary="Products & Services" /></ListItem>
 <ListItem button onClick={() => scrollToSection(galleryRef)}><ListItemText primary="Photos & Videos" /></ListItem>
 <ListItem button onClick={() => scrollToSection(reachUsRef)}><ListItemText primary="Reach Us" /></ListItem>
 </List>
 <Divider />
 <Button fullWidth startIcon={<DownloadIcon />} sx={{ py: 1.5, color: '#d32f2f', fontWeight: 'bold' }}>
 Download Brochure
 </Button>
 </Paper>

 <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Typography variant="subtitle2" fontWeight="bold">Quick Contact</Typography>
 <Typography variant="caption" display="block" sx={{ mt: 1 }}><strong>GST:</strong> 19AAWFR2093L1ZA</Typography>
 <Typography variant="caption" display="block"><strong>Location:</strong> Belgachia, Kolkata</Typography>
 <Divider sx={{ my: 1 }} />
 <Button variant="contained" color="primary" fullWidth sx={{ mb: 1, fontWeight: 'bold' }} href="tel:08048261962">
 Call Now
 </Button>
 <Button variant="outlined" color="secondary" fullWidth sx={{ mb: 1, fontWeight: 'bold' }} href="mailto:info@rightsolutions.com">
 Email Us
 </Button>
 <Button variant="outlined" color="primary" fullWidth sx={{ mb: 1, fontWeight: 'bold' }} href="https://wa.me/919999999999" target="_blank">
 WhatsApp
 </Button>
 <Button variant="outlined" color="primary" fullWidth sx={{ fontWeight: 'bold' }} onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}>
 Send Inquiry
 </Button>
 </Paper>
 </Box>
 </Grid>

 {/* MAIN CONTENT SECTIONS */}
 <Grid item xs={12} md={9}>
 
 {/* ABOUT SECTION */}
 <Box ref={aboutRef} sx={{ mb: 4 }}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: theme.palette.background.paper }}>
 <Typography variant="h5" fontWeight="bold" gutterBottom>About Us</Typography>
 <Divider sx={{ mb: 2 }} />
 <Typography variant="body1" paragraph>
 Established in 2010, <strong>Right Solutions</strong> is a prominent manufacturer and service provider specializing in <strong>Epoxy Resins</strong> and <strong>Waterproofing Chemicals</strong>.
 </Typography>
 <Typography variant="body2" color="textSecondary">
 Our core services include Epoxy Flooring, Waterproofing, Injection Grouting, and Building Rehabilitation.
 </Typography>
 </Paper>
 </Box>

 {/* MEET OUR TEAM SECTION */}
 <Box sx={{ mb: 4 }}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: theme.palette.background.default, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Typography variant="h5" fontWeight="bold" gutterBottom>Meet Our Team</Typography>
 <Divider sx={{ mb: 2 }} />
 <Grid container spacing={3} justifyContent="flex-start">
 <Grid item xs={12} sm={6} md={3}>
 <Box sx={{ textAlign: 'center' }}>
 <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
 <Typography variant="subtitle1" fontWeight="bold">Som Samanta</Typography>
 <Typography variant="caption" color="textSecondary">Owner / Partner</Typography>
 </Box>
 </Grid>
 <Grid item xs={12} sm={6} md={3}>
 <Box sx={{ textAlign: 'center' }}>
 <Avatar src="https://randomuser.me/api/portraits/men/45.jpg" sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
 <Typography variant="subtitle1" fontWeight="bold">Rakesh Mehta</Typography>
 <Typography variant="caption" color="textSecondary">Project Manager</Typography>
 </Box>
 </Grid>
 <Grid item xs={12} sm={6} md={3}>
 <Box sx={{ textAlign: 'center' }}>
 <Avatar src="https://randomuser.me/api/portraits/women/65.jpg" sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
 <Typography variant="subtitle1" fontWeight="bold">Sonal Gupta</Typography>
 <Typography variant="caption" color="textSecondary">Customer Relations</Typography>
 </Box>
 </Grid>
 <Grid item xs={12} sm={6} md={3}>
 <Box sx={{ textAlign: 'center' }}>
 <Avatar src="https://randomuser.me/api/portraits/men/77.jpg" sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
 <Typography variant="subtitle1" fontWeight="bold">Amit Sharma</Typography>
 <Typography variant="caption" color="textSecondary">Senior Technician</Typography>
 </Box>
 </Grid>
 </Grid>
 <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
 Our team is dedicated to your safety and satisfaction. When you see our faces, you know you’re in good hands.
 </Typography>
 </Paper>
 </Box>

 {/* PRODUCTS SECTION */}
 <Box ref={productsRef} sx={{ mb: 4 }}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: theme.palette.background.paper }}>
 <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Products & Services</Typography>
 <Grid container spacing={2}>
 {services.map((item, index) => (
 <Grid item xs={12} sm={6} key={index}>
 <Card variant="outlined" sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: theme.palette.background.paper }}>
 <Box component="img" src={item.img} sx={{ height: 160, width: '100%', objectFit: 'cover' }} />
 <CardContent>
 <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
 <Typography variant="h6" color="primary">{item.price}</Typography>
 <Button variant="contained" size="small" color="primary" sx={{ mt: 1 }}>Get Best Price</Button>
 </CardContent>
 </Card>
 </Grid>
 ))}
 </Grid>
 </Paper>
 </Box>


 {/* RATINGS & REVIEWS SECTION */}
 <Box sx={{ mb: 4 }}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: theme.palette.background.paper, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Ratings & Reviews</Typography>
 <Grid container spacing={3}>
 {/* Summary and breakdown */}
 <Grid item xs={12} md={6}>
 <Box sx={{ textAlign: 'center', mb: 2 }}>
 <Typography variant="h3" fontWeight="bold" color="primary.main">4.4/5</Typography>
 <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 'bold', letterSpacing: 1, mb: 0.5 }}>★★★★★★★★★★</Typography>
 <Typography variant="body2" color="textSecondary">93 Ratings</Typography>
 </Box>
 <Box>
 {[{label:'5 star',value:59},{label:'4 star',value:15},{label:'3 star',value:8},{label:'2 star',value:5},{label:'1 star',value:13}].map((item, idx) => (
 <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
 <Typography variant="body2" sx={{ minWidth: 48 }}>{item.label}</Typography>
 <Box sx={{ flex: 1, mx: 1, bgcolor: theme.palette.divider, borderRadius: 1, height: 8, position: 'relative' }}>
 <Box sx={{ width: `${item.value}%`, bgcolor: theme.palette.success.main, height: 8, borderRadius: 1, position: 'absolute', left: 0, top: 0 }} />
 </Box>
 <Typography variant="body2" sx={{ minWidth: 32, textAlign: 'right' }}>{item.value}%</Typography>
 </Box>
 ))}
 </Box>
 </Grid>
 {/* User Satisfaction */}
 <Grid item xs={12} md={6}>
 <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>User Satisfaction</Typography>
 <Box sx={{ mb: 1 }}>
 <Typography variant="body2">Response</Typography>
 <Box sx={{ width: '100%', bgcolor: theme.palette.divider, borderRadius: 1, height: 8, position: 'relative', mb: 0.5 }}>
 <Box sx={{ width: '70%', bgcolor: theme.palette.success.main, height: 8, borderRadius: 1, position: 'absolute', left: 0, top: 0 }} />
 </Box>
 <Typography variant="caption" color="textSecondary">70%</Typography>
 </Box>
 <Box sx={{ mb: 1 }}>
 <Typography variant="body2">Quality</Typography>
 <Box sx={{ width: '100%', bgcolor: theme.palette.divider, borderRadius: 1, height: 8, position: 'relative', mb: 0.5 }}>
 <Box sx={{ width: '85%', bgcolor: theme.palette.success.main, height: 8, borderRadius: 1, position: 'absolute', left: 0, top: 0 }} />
 </Box>
 <Typography variant="caption" color="textSecondary">85%</Typography>
 </Box>
 <Box>
 <Typography variant="body2">Delivery</Typography>
 <Box sx={{ width: '100%', bgcolor: theme.palette.divider, borderRadius: 1, height: 8, position: 'relative', mb: 0.5 }}>
 <Box sx={{ width: '90%', bgcolor: theme.palette.success.main, height: 8, borderRadius: 1, position: 'absolute', left: 0, top: 0 }} />
 </Box>
 <Typography variant="caption" color="textSecondary">90%</Typography>
 </Box>
 </Grid>
 </Grid>
 {/* Most Relevant Reviews - below */}
 <Box sx={{ mt: 4 }}>
 <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Most Relevant Reviews</Typography>
 <Grid container spacing={2}>
 <Grid item xs={12} md={6}>
 <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
 <Avatar sx={{ width: 32, height: 32, mr: 1 }}>C</Avatar>
 <Box>
 <Typography variant="subtitle2" fontWeight="bold">CM INTERIORS</Typography>
 <Typography variant="caption" color="textSecondary">Raipur, Chhattisgarh</Typography>
 </Box>
 </Box>
 <Typography variant="body2" sx={{ color: '#ffb300', fontWeight: 'bold', mb: 0.5 }}>★★★★★★★★★★</Typography>
 <Typography variant="caption" color="textSecondary">14-November-25 | Product Name : Floor Underlayments</Typography>
 </Paper>
 </Grid>
 <Grid item xs={12} md={6}>
 <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
 <Avatar sx={{ width: 32, height: 32, mr: 1 }}>A</Avatar>
 <Box>
 <Typography variant="subtitle2" fontWeight="bold">Abadil Ansari</Typography>
 <Typography variant="caption" color="textSecondary">Bidhan Nagar, West Bengal</Typography>
 </Box>
 </Box>
 <Typography variant="body2" sx={{ color: '#ffb300', fontWeight: 'bold', mb: 0.5 }}>★★★★★★★★★★</Typography>
 <Typography variant="caption" color="textSecondary">26-October-25 | Product Name : ARDEX ENDURA Tile Adhesives</Typography>
 </Paper>
 </Grid>
 </Grid>
 <Button variant="outlined" color="primary" size="small" sx={{ fontWeight: 'bold', mt: 2 }}>View More Reviews</Button>
 </Box>
 </Paper>
 </Box>

 {/* GALLERY SECTION */}
 <Box ref={galleryRef} sx={{ mb: 4 }}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Photos & Videos</Typography>
 <Grid container spacing={2}>
 {[1, 2, 3].map((i) => (
 <Grid item xs={4} key={i}>
 <Paper sx={{ height: 120, bgcolor: '#e0e0e0', borderRadius: 2 }} />
 </Grid>
 ))}
 </Grid>
 </Paper>
 </Box>

 {/* REACH US SECTION */}
 <Box ref={reachUsRef}>
 <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
 <Typography variant="h5" fontWeight="bold" gutterBottom>Reach Us</Typography>
 <Divider sx={{ mb: 2 }} />
 <Grid container spacing={3}>
 <Grid item xs={12} md={6}>
 <Typography variant="subtitle1" fontWeight="bold">Address</Typography>
 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
 PS- Ultadanga 64/1/28B,<br />
 Khudiram Bose Sarani, Belgachia,<br />
 Kolkata - 700037, West Bengal, India
 </Typography>
 <Button variant="outlined" color="primary" href="https://goo.gl/maps/xyz" target="_blank">Get Directions</Button>
 </Grid>
 <Grid item xs={12} md={6}>
 <Box 
 sx={{ 
 width: '100%', height: 150, borderRadius: 2, border: '1px solid #ddd',
 overflow: 'hidden',
 bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' 
 }}
 >
 {/* Embedded Google Map */}
 <iframe
 title="Right Solutions Location"
 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.123456789!2d88.377!3d22.603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMjLCsDM2JzExLjAiTiA4OMKwMjInMzcuMCJF!5e0!3m2!1sen!2sin!4v1234567890" 
 width="100%" height="150" style={{ border: 0 }} allowFullScreen loading="lazy"
 />
 </Box>
 </Grid>
 </Grid>
 {/* Inquiry Form */}
 <Box sx={{ mt: 4 }}>
 <Typography variant="h6" fontWeight="bold" gutterBottom>Send Us an Inquiry</Typography>
 <Grid container spacing={2}>
 <Grid item xs={12} md={6}>
 <input type="text" placeholder="Your Name" style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 4, border: '1px solid #ccc' }} />
 </Grid>
 <Grid item xs={12} md={6}>
 <input type="email" placeholder="Your Email" style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 4, border: '1px solid #ccc' }} />
 </Grid>
 <Grid item xs={12}>
 <textarea placeholder="Your Message" rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
 </Grid>
 <Grid item xs={12}>
 <Button variant="contained" color="success" sx={{ fontWeight: 'bold' }}>Submit Inquiry</Button>
 </Grid>
 </Grid>
 </Box>
 </Paper>
 </Box>

 </Grid>
 </Grid>
 </Container>
 {/* VENDOR FOOTER */}
 <Box component="footer" sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.secondary, py: 3, mt: 6, borderTop: `1px solid ${theme.palette.divider}` }}>
 <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
 <Typography variant="body2" sx={{ fontWeight: 500 }}>
 &copy; {new Date().getFullYear()} Right Solutions. All rights reserved.
 </Typography>
 <Typography variant="body2" sx={{ mt: { xs: 1, md: 0 } }}>
 Kolkata, West Bengal | GST: 19AAWFR2093L1ZA
 </Typography>
 </Container>
 </Box>
 </Box>
 );
};

export default VendorStorefront;