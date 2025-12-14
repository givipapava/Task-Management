import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  describe('page validation', () => {
    it('should pass validation with valid page number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
    });

    it('should pass validation when page is missing (optional)', async () => {
      const dto = plainToInstance(PaginationQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform string to number', () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '5',
      });

      expect(typeof dto.page).toBe('number');
      expect(dto.page).toBe(5);
    });

    it('should fail validation when page is less than 1', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '0',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when page is negative', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '-1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when page is not an integer', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '1.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when page is not a number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: 'abc',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });
  });

  describe('pageSize validation', () => {
    it('should pass validation with valid pageSize', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '10',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.pageSize).toBe(10);
    });

    it('should pass validation when pageSize is missing (optional)', async () => {
      const dto = plainToInstance(PaginationQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform string to number', () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '25',
      });

      expect(typeof dto.pageSize).toBe('number');
      expect(dto.pageSize).toBe(25);
    });

    it('should pass validation with pageSize of 1', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with pageSize of 100', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '100',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when pageSize is less than 1', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '0',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageSize');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when pageSize exceeds 100', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '101',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageSize');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when pageSize is not an integer', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '10.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageSize');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when pageSize is not a number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: 'xyz',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageSize');
    });
  });

  describe('combined validation', () => {
    it('should pass validation with both valid page and pageSize', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '2',
        pageSize: '20',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(2);
      expect(dto.pageSize).toBe(20);
    });

    it('should pass validation with empty object (all optional)', async () => {
      const dto = plainToInstance(PaginationQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when both page and pageSize are invalid', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '0',
        pageSize: '101',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(2);
      expect(errors.some((e) => e.property === 'page')).toBe(true);
      expect(errors.some((e) => e.property === 'pageSize')).toBe(true);
    });

    it('should transform query string values to numbers', () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '3',
        pageSize: '50',
      });

      expect(typeof dto.page).toBe('number');
      expect(typeof dto.pageSize).toBe('number');
      expect(dto.page).toBe(3);
      expect(dto.pageSize).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('should handle large valid page numbers', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '1000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1000);
    });

    it('should reject decimal page numbers', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: '2.5',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should reject decimal pageSize', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        pageSize: '15.7',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageSize');
    });
  });
});
