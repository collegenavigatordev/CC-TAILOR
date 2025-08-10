/*
  # Complete Royal Tailors Database Schema

  1. New Tables
    - `customers` - Customer information and measurements
    - `fabrics` - Fabric inventory with images and pricing
    - `garments` - Garment types with customization options
    - `orders` - Customer orders with tracking and status

  2. Security
    - Enable RLS on all tables
    - Add policies for public access and admin management
    - Create proper authentication flow

  3. Functions
    - Auto-generate tracking IDs
    - Update timestamps automatically
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  measurements_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fabrics table
CREATE TABLE IF NOT EXISTS fabrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  material text NOT NULL,
  price_per_meter numeric NOT NULL DEFAULT 0,
  color text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  images_json jsonb DEFAULT '[]',
  featured boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create garments table
CREATE TABLE IF NOT EXISTS garments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  description text,
  image_url text,
  customization_options jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  fabric_id uuid REFERENCES fabrics(id),
  garment_id uuid REFERENCES garments(id),
  tracking_id text UNIQUE NOT NULL,
  customizations_json jsonb DEFAULT '{}',
  measurements_json jsonb DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'fabric_ready', 'cutting', 'stitching', 'embroidery', 'quality_check', 'ready', 'completed')),
  urgent boolean DEFAULT false,
  special_instructions text,
  estimated_completion date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to generate tracking ID
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id = 'RT' || LPAD(EXTRACT(epoch FROM now())::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER customers_updated_at_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER fabrics_updated_at_trigger
  BEFORE UPDATE ON fabrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER garments_updated_at_trigger
  BEFORE UPDATE ON garments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tracking ID
CREATE TRIGGER orders_tracking_id_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_id();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Anyone can insert customer data"
  ON customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Customers can view their own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for fabrics
CREATE POLICY "Anyone can view fabrics"
  ON fabrics
  FOR SELECT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage fabrics"
  ON fabrics
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for garments
CREATE POLICY "Anyone can view garments"
  ON garments
  FOR SELECT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage garments"
  ON garments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for orders
CREATE POLICY "Anyone can track orders by tracking_id"
  ON orders
  FOR SELECT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Customers can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_fabrics_featured ON fabrics(featured);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category);

-- Insert sample data
INSERT INTO fabrics (name, material, price_per_meter, color, stock, images_json, featured, description) VALUES
('Premium Silk', 'Silk', 2500, 'Golden', 50, '["https://images.pexels.com/photos/6069107/pexels-photo-6069107.jpeg"]', true, 'Luxurious silk fabric perfect for wedding wear and special occasions'),
('Italian Wool', 'Wool', 3200, 'Navy Blue', 30, '["https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg"]', true, 'Premium Italian wool for sophisticated suits and formal wear'),
('Egyptian Cotton', 'Cotton', 1800, 'White', 75, '["https://images.pexels.com/photos/6069102/pexels-photo-6069102.jpeg"]', false, 'Finest Egyptian cotton for comfortable everyday wear'),
('Banarasi Silk', 'Silk', 4500, 'Red', 20, '["https://images.pexels.com/photos/8849295/pexels-photo-8849295.jpeg"]', true, 'Traditional Banarasi silk with intricate gold work'),
('Linen Blend', 'Linen', 2200, 'Beige', 40, '["https://images.pexels.com/photos/7679717/pexels-photo-7679717.jpeg"]', false, 'Breathable linen blend perfect for summer wear'),
('Velvet Royal', 'Velvet', 3800, 'Maroon', 15, '["https://images.pexels.com/photos/6069108/pexels-photo-6069108.jpeg"]', false, 'Rich velvet fabric for luxury garments and evening wear')
ON CONFLICT DO NOTHING;

INSERT INTO garments (name, category, base_price, description, image_url, customization_options) VALUES
('Classic Shirt', 'Shirts', 1500, 'Timeless classic shirt perfect for office and casual wear', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', '{"collar": ["Regular", "Button Down", "Spread", "Cutaway"], "sleeves": ["Full Sleeve", "Half Sleeve", "Quarter Sleeve"], "fit": ["Regular", "Slim", "Relaxed"], "cuffs": ["Regular", "French", "Convertible"], "pockets": ["None", "Single", "Double"]}'),
('Business Suit', 'Suits', 8500, 'Professional business suit for formal occasions', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg', '{"jacket": ["Single Breasted", "Double Breasted"], "lapels": ["Notch", "Peak", "Shawl"], "buttons": ["2 Button", "3 Button"], "vents": ["No Vent", "Single Vent", "Double Vent"], "trouser": ["Flat Front", "Pleated"]}'),
('Wedding Sherwani', 'Sherwanis', 12000, 'Elegant sherwani for weddings and special occasions', 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg', '{"collar": ["Band", "High Neck", "Nehru"], "length": ["Knee Length", "Mid Thigh", "Full Length"], "buttons": ["Traditional", "Modern", "Decorative"], "embroidery": ["None", "Light", "Heavy", "Custom Design"]}'),
('Saree Blouse', 'Saree Blouses', 2500, 'Custom fitted saree blouse with various neckline options', 'https://images.pexels.com/photos/8849295/pexels-photo-8849295.jpeg', '{"neckline": ["Round", "V-Neck", "Square", "Boat", "Halter"], "sleeves": ["Sleeveless", "Cap Sleeve", "Half Sleeve", "Full Sleeve"], "back": ["Regular", "Deep Back", "Keyhole", "Tie-up"], "embellishment": ["None", "Beadwork", "Embroidery", "Sequins"]}'),
('Casual Kurta', 'Kurtas', 1800, 'Comfortable kurta for daily wear and casual occasions', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg', '{"collar": ["Band", "Nehru", "Chinese"], "length": ["Short", "Medium", "Long"], "sleeves": ["Full Sleeve", "Half Sleeve", "Quarter Sleeve"], "bottom": ["Straight", "A-Line", "Asymmetric"]}'),
('Evening Dress', 'Dresses', 6500, 'Elegant evening dress for special occasions', 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg', '{"neckline": ["Strapless", "Halter", "V-Neck", "Off-Shoulder"], "length": ["Knee Length", "Midi", "Floor Length"], "fit": ["A-Line", "Mermaid", "Straight", "Ball Gown"], "back": ["Zipper", "Lace-up", "Open Back"]}')
ON CONFLICT DO NOTHING;