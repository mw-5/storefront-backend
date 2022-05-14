import { textSpanContainsPosition } from 'typescript';
import db from '../../../src/database';
import { Product, ProductStore } from '../../../src/models/product';

/**
 * @description Populate tables products and categories.
 */
 const populateTestDb = async (): Promise<void> => {
    let sql: string;        
    const conn = await db.connect();

    // Populate table categories
    sql = 'INSERT INTO categories (id, name) VALUES (1, \'test\');';
    await conn.query(sql);

    // Populate table products
    sql = 'INSERT INTO products (name, price, category_id)' +
        ' VALUES (\'p1\', 100, 1);';
    await conn.query(sql);

    conn.release();
};

/**
 * @description Empty tables products and categories.
 */
const emptyTestDb = async (): Promise<void> => {
    let sql: string
    const conn = await db.connect();
    
    // Empty table products
    sql = 'DELETE FROM products;';
    await conn.query(sql);

    // Empty table categories
    sql = 'DELETE FROM categories;';
    await conn.query(sql);

    conn.release();
};

describe('Test for model ProductStore', () => {
    const store = new ProductStore();

    // Create
    describe('method create', () => {
        beforeEach(populateTestDb);
        afterEach(emptyTestDb);

        it('expects method to be defined', () => {
            expect(store.create).toBeDefined();
        });
    
        it('expects product to be created', async () => {
            // Arrange
            const p: Product = {
                name: 'testProduct',
                price: '100',
                category_id: '1'
            };
            
            // Act
            const newProduct = await store.create(p);            

            // Assert            
            // id is generated on creation
            // hence it has to be set on input afterwards
            // for input und result to be comparable.
            p.id = newProduct.id;
            expect(newProduct).toEqual(p);
        });
    
        it('expects to throw error for invalid category', async () => {
            // Arrange
            const p = {
                name: 'testProduct',
                price: '100',
                category_id: '-1'
            };
    
            // Act & Assert
            await expectAsync(
                store.create(p)
            ).toBeRejectedWithError();
        });
    });
});
