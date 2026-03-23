import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-card border-t border-border/50 pt-16 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black tracking-tighter uppercase">
                            <span className="text-foreground">GRO</span>
                            <span className="text-accent ml-1">FAST</span>
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Bringing fresh groceries and daily essentials from your local vendors straight to your doorstep in minutes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                                <Facebook className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shop All</Link></li>
                            <li><Link to="/vendor" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vendor Dashboard</Link></li>
                            <li><Link to="/checkout" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Orders</Link></li>
                            <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Groceries</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Bakery</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dairy</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Snacks</a></li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">Wakad, Pune, Maharashtra 411033</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm text-muted-foreground">+91 9359570497</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm text-muted-foreground">khudeshivam33@gmail.com</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-xs text-muted-foreground">
                        &copy; 2026 AXENOR Studio. All Rights Reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
