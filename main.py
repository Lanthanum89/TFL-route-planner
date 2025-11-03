#!/usr/bin/env python3
"""
London Underground Route Planner
A GUI application using tkinter for planning routes on the London Underground
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Dict, List, Tuple, Optional
import json
from collections import defaultdict, deque
import webbrowser

class LondonUndergroundApp:
    def __init__(self, root):
        self.root = root
        self.root.title("London Underground Route Planner")
        self.root.geometry("900x700")
        self.root.configure(bg='#003366')  # TfL blue
        
        # Initialize data
        self.tube_network = TubeNetwork()
        
        # Setup GUI
        self.setup_styles()
        self.create_widgets()
        
    def setup_styles(self):
        """Configure custom styles for the application"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure custom styles
        style.configure('Title.TLabel', 
                       background='#003366', 
                       foreground='white', 
                       font=('Arial', 16, 'bold'))
        style.configure('Header.TLabel', 
                       background='#003366', 
                       foreground='white', 
                       font=('Arial', 12, 'bold'))
        style.configure('Custom.TCombobox', 
                       fieldbackground='white')
        
    def create_widgets(self):
        """Create and arrange all GUI widgets"""
        # Main title
        title_frame = tk.Frame(self.root, bg='#003366')
        title_frame.pack(fill='x', padx=10, pady=10)
        
        title_label = ttk.Label(title_frame, 
                               text="🚇 London Underground Route Planner", 
                               style='Title.TLabel')
        title_label.pack()
        
        # Main content frame
        content_frame = tk.Frame(self.root, bg='#003366')
        content_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Left panel for route input
        left_panel = tk.Frame(content_frame, bg='white', relief='raised', bd=2)
        left_panel.pack(side='left', fill='y', padx=(0, 5))
        
        # Route selection section
        self.create_route_selection(left_panel)
        
        # Right panel for results
        right_panel = tk.Frame(content_frame, bg='white', relief='raised', bd=2)
        right_panel.pack(side='right', fill='both', expand=True, padx=(5, 0))
        
        # Results section
        self.create_results_section(right_panel)
        
        # Status bar
        self.create_status_bar()
        
    def create_route_selection(self, parent):
        """Create route selection widgets"""
        route_frame = tk.Frame(parent, bg='white')
        route_frame.pack(fill='both', padx=15, pady=15)
        
        # From station
        ttk.Label(route_frame, text="From:", font=('Arial', 11, 'bold')).pack(anchor='w', pady=(0, 5))
        self.from_var = tk.StringVar()
        self.from_combo = ttk.Combobox(route_frame, textvariable=self.from_var, 
                                      style='Custom.TCombobox', width=30)
        self.from_combo['values'] = sorted(self.tube_network.get_all_stations())
        self.from_combo.pack(fill='x', pady=(0, 10))
        
        # Swap button
        swap_frame = tk.Frame(route_frame, bg='white')
        swap_frame.pack(fill='x', pady=(0, 10))
        
        swap_button = tk.Button(swap_frame, text="⇄", 
                               command=self.swap_stations,
                               bg='#0098D4', fg='white', 
                               font=('Arial', 14, 'bold'),
                               relief='flat', width=3, height=1)
        swap_button.pack()
        
        # To station
        ttk.Label(route_frame, text="To:", font=('Arial', 11, 'bold')).pack(anchor='w', pady=(0, 5))
        self.to_var = tk.StringVar()
        self.to_combo = ttk.Combobox(route_frame, textvariable=self.to_var, 
                                    style='Custom.TCombobox', width=30)
        self.to_combo['values'] = sorted(self.tube_network.get_all_stations())
        self.to_combo.pack(fill='x', pady=(0, 15))
        
        # Plan route button
        plan_button = tk.Button(route_frame, text="Plan Route", 
                               command=self.plan_route,
                               bg='#E32017', fg='white', 
                               font=('Arial', 12, 'bold'),
                               relief='flat', padx=20, pady=10)
        plan_button.pack(pady=15)
        
        # Clear button
        clear_button = tk.Button(route_frame, text="Clear", 
                                command=self.clear_route,
                                bg='#666666', fg='white', 
                                font=('Arial', 10),
                                relief='flat', padx=20, pady=5)
        clear_button.pack(pady=5)
        
        # Options frame
        options_frame = tk.LabelFrame(route_frame, text="Options", 
                                     font=('Arial', 10, 'bold'), padx=10, pady=10)
        options_frame.pack(fill='x', pady=15)
        
        self.show_interchanges = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Show interchanges", 
                       variable=self.show_interchanges).pack(anchor='w')
        
        self.show_step_by_step = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Step-by-step directions", 
                       variable=self.show_step_by_step).pack(anchor='w')
        
        self.colorize_legs = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Colorize legs by line", 
                       variable=self.colorize_legs).pack(anchor='w')
        
    def create_results_section(self, parent):
        """Create results display section"""
        results_frame = tk.Frame(parent, bg='white')
        results_frame.pack(fill='both', expand=True, padx=15, pady=15)
        
        # Results header
        header_frame = tk.Frame(results_frame, bg='white')
        header_frame.pack(fill='x', pady=(0, 10))
        
        ttk.Label(header_frame, text="Route Details", 
                 font=('Arial', 14, 'bold')).pack(side='left')
        
        # Journey summary frame
        self.summary_frame = tk.Frame(results_frame, bg='#f0f0f0', relief='raised', bd=1)
        self.summary_frame.pack(fill='x', pady=(0, 10))
        
        # Scrollable text area for route details
        text_frame = tk.Frame(results_frame)
        text_frame.pack(fill='both', expand=True)
        
        self.route_text = tk.Text(text_frame, wrap='word', font=('Consolas', 10),
                                 bg='white', relief='sunken', bd=1)
        scrollbar = ttk.Scrollbar(text_frame, orient='vertical', command=self.route_text.yview)
        self.route_text.configure(yscrollcommand=scrollbar.set)
        
        self.route_text.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        # Initial welcome message
        self.show_welcome_message()
        
    def create_status_bar(self):
        """Create status bar at bottom of window"""
        self.status_var = tk.StringVar()
        self.status_var.set("Ready - Select stations and click 'Plan Route'")
        
        status_bar = ttk.Label(self.root, textvariable=self.status_var, 
                              relief='sunken', anchor='w')
        status_bar.pack(side='bottom', fill='x')
        
    def show_welcome_message(self):
        """Display welcome message in the route text area"""
        welcome_text = """Welcome to the London Underground Route Planner! 🚇

Features:
• Plan routes between any two London Underground stations
• View step-by-step directions with line information
• See interchange points and walking times
• Estimated journey times included

Instructions:
1. Select your starting station from the 'From' dropdown
2. Select your destination station from the 'To' dropdown  
3. Click 'Plan Route' to find the best route
4. View detailed directions in this area

Tips:
• Use the search function in dropdowns to quickly find stations
• Check the options below for additional route information
• Future versions will include live service updates via TfL API

Ready to plan your journey?"""
        
        self.route_text.delete(1.0, tk.END)
        self.route_text.insert(1.0, welcome_text)
        
    def plan_route(self):
        """Plan route between selected stations"""
        from_station = self.from_var.get().strip()
        to_station = self.to_var.get().strip()
        
        if not from_station or not to_station:
            messagebox.showwarning("Input Required", 
                                 "Please select both starting and destination stations.")
            return
        
        if from_station == to_station:
            messagebox.showinfo("Same Station", 
                               "Starting and destination stations are the same!")
            return
        
        if from_station not in self.tube_network.get_all_stations():
            messagebox.showerror("Invalid Station", 
                               f"Starting station '{from_station}' not found.")
            return
            
        if to_station not in self.tube_network.get_all_stations():
            messagebox.showerror("Invalid Station", 
                               f"Destination station '{to_station}' not found.")
            return
        
        self.status_var.set("Planning route...")
        self.root.update()
        
        try:
            route = self.tube_network.find_route(from_station, to_station)
            if route:
                self.display_route(route, from_station, to_station)
                self.status_var.set(f"Route found: {len(route)} stations")
            else:
                self.route_text.delete(1.0, tk.END)
                self.route_text.insert(1.0, "No route found between these stations.")
                self.status_var.set("No route found")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred while planning the route: {str(e)}")
            self.status_var.set("Error planning route")
            
    def display_route(self, route, from_station, to_station):
        """Display the planned route with details"""
        self.route_text.delete(1.0, tk.END)
        
        # Clear and update summary frame
        for widget in self.summary_frame.winfo_children():
            widget.destroy()
            
        # Journey summary
        total_stops = len(route) - 1
        estimated_time = total_stops * 2  # Rough estimate: 2 minutes per stop
        
        summary_text = f"Journey from {from_station} to {to_station}\n"
        summary_text += f"Total stops: {total_stops} | Estimated time: {estimated_time} minutes"
        
        summary_label = tk.Label(self.summary_frame, text=summary_text, 
                                font=('Arial', 11, 'bold'), bg='#f0f0f0')
        summary_label.pack(pady=5)
        
        # Detailed route header
        header = f"🚇 ROUTE DETAILS\n" + ("=" * 50) + "\n\n"
        self.route_text.insert(tk.END, header)

        # Structured legs for colorized rendering
        legs = self.tube_network.get_route_legs(route)
        for i, (line_name, leg_start, leg_end, stops) in enumerate(legs, 1):
            if line_name == 'Walk':
                line_text = f"{i}. Walk from {leg_start} to {leg_end} ({stops} stops)\n"
            else:
                line_text = f"{i}. Take {line_name} Line from {leg_start} to {leg_end} ({stops} stops)\n"

            start_index = self.route_text.index(tk.END)
            self.route_text.insert(tk.END, line_text)
            end_index = self.route_text.index(tk.END)

            if self.colorize_legs.get():
                tag = self._line_to_tag(line_name)
                self._ensure_line_tag(line_name)
                self.route_text.tag_add(tag, start_index, end_index)
            
        if self.show_step_by_step.get():
            section_header = "\n" + ("=" * 50) + "\n" + "STEP-BY-STEP DIRECTIONS:\n\n"
            self.route_text.insert(tk.END, section_header)
            for i, station in enumerate(route):
                if i == 0:
                    self.route_text.insert(tk.END, f"🚀 START: Board at {station}\n")
                elif i == len(route) - 1:
                    self.route_text.insert(tk.END, f"🎯 END: Alight at {station}\n")
                else:
                    lines = self.tube_network.get_station_lines(station)
                    if len(lines) > 1 and self.show_interchanges.get():
                        self.route_text.insert(tk.END, f"🔄 INTERCHANGE: {station} (Lines: {', '.join(lines)})\n")
                    else:
                        self.route_text.insert(tk.END, f"   → {station}\n")

        footer = "\n" + ("=" * 50) + "\n" + "💡 TIP: Check TfL website for live service updates\n" + "🌐 Future version will include live API integration"
        self.route_text.insert(tk.END, footer)

    def _line_to_tag(self, line_name: str) -> str:
        safe = ''.join(ch if ch.isalnum() else '_' for ch in (line_name or 'Unknown'))
        return f"line_{safe}"

    def _ensure_line_tag(self, line_name: str):
        tag = self._line_to_tag(line_name)
        if tag in self.route_text.tag_names():
            return
        # Choose colors
        if line_name == 'Walk':
            bg = '#888888'
        else:
            bg = self.tube_network.line_colors.get(line_name, '#666666')
        fg = self._contrast_text_color(bg)
        self.route_text.tag_configure(tag, background=bg, foreground=fg)

    def _contrast_text_color(self, hex_color: str) -> str:
        """Return '#000000' or '#FFFFFF' depending on background luminance for contrast."""
        try:
            hc = hex_color.lstrip('#')
            r = int(hc[0:2], 16)
            g = int(hc[2:4], 16)
            b = int(hc[4:6], 16)
        except Exception:
            return '#FFFFFF'
        # Relative luminance (sRGB)
        def srgb(c):
            c = c / 255.0
            return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
        return '#000000' if L > 0.6 else '#FFFFFF'
    
    def swap_stations(self):
        """Swap the From and To station selections"""
        from_station = self.from_var.get()
        to_station = self.to_var.get()
        
        # Swap the values
        self.from_var.set(to_station)
        self.to_var.set(from_station)
        
        # Update status
        if from_station and to_station:
            self.status_var.set(f"Swapped: {to_station} ⇄ {from_station}")
        else:
            self.status_var.set("Stations swapped")
        
    def clear_route(self):
        """Clear route selection and results"""
        self.from_var.set("")
        self.to_var.set("")
        
        # Clear summary frame
        for widget in self.summary_frame.winfo_children():
            widget.destroy()
            
        self.show_welcome_message()
        self.status_var.set("Route cleared - Ready for new search")

if __name__ == "__main__":
    # Import the TubeNetwork class
    from tube_network import TubeNetwork
    
    root = tk.Tk()
    app = LondonUndergroundApp(root)
    root.mainloop()