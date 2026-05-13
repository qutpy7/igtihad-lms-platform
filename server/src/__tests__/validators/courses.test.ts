import { createCourseSchema } from '../../validators/courses';

describe('createCourseSchema', () => {
    it('should validate successfully with minimal required fields and provide default values', () => {
        const payload = {
            title: 'Mathematics 101',
            grade: '10th Grade'
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual({
            title: 'Mathematics 101',
            grade: '10th Grade',
            term: 'first',
            price: 0,
            original_price: 0,
            is_featured: false,
            is_active: true
        });
    });

    it('should validate successfully with all fields provided', () => {
        const payload = {
            title: 'Mathematics 101',
            description: 'A comprehensive introduction to mathematics.',
            short_desc: 'Intro to Math',
            grade: '10th Grade',
            term: 'second',
            price: 150,
            original_price: 200,
            color: '#ff0000',
            thumbnail_url: 'https://example.com/math.jpg',
            is_featured: true,
            is_active: false
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(payload);
    });

    it('should fail validation when title is missing and return custom error message', () => {
        const payload = {
            grade: '10th Grade'
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeDefined();
        expect(result.error?.details[0].message).toBe('عنوان الكورس مطلوب');
    });

    it('should fail validation when title is too short', () => {
        const payload = {
            title: 'M',
            grade: '10th Grade'
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeDefined();
        expect(result.error?.details[0].context?.key).toBe('title');
        expect(result.error?.details[0].type).toBe('string.min');
    });

    it('should fail validation when grade is missing and return custom error message', () => {
        const payload = {
            title: 'Mathematics 101'
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeDefined();
        expect(result.error?.details[0].message).toBe('المرحلة الدراسية مطلوبة');
    });

    it('should fail validation when term is an invalid string', () => {
        const payload = {
            title: 'Mathematics 101',
            grade: '10th Grade',
            term: 'third'
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeDefined();
        expect(result.error?.details[0].context?.key).toBe('term');
        expect(result.error?.details[0].type).toBe('any.only');
    });

    it('should fail validation when price is negative', () => {
        const payload = {
            title: 'Mathematics 101',
            grade: '10th Grade',
            price: -10
        };

        const result = createCourseSchema.validate(payload);

        expect(result.error).toBeDefined();
        expect(result.error?.details[0].context?.key).toBe('price');
        expect(result.error?.details[0].type).toBe('number.min');
    });
});
