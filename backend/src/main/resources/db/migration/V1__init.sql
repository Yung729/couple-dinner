-- V1: Initial schema for Couple Dinner application

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code VARCHAR(8) NOT NULL UNIQUE,
    user1_id UUID NOT NULL REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    formed_at TIMESTAMP
);

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE menu_item_ingredients (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    PRIMARY KEY (menu_item_id, ingredient_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    requested_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE refrigerator_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    added_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_created_by ON menu_items(created_by);
CREATE INDEX idx_orders_requested_by ON orders(requested_by);
CREATE INDEX idx_orders_scheduled_time ON orders(scheduled_time);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_refrigerator_items_ingredient ON refrigerator_items(ingredient_name);
