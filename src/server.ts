import express from "express";

const app = express();
const port = 3000;

const exampleDiscounts = {
  save20: {
    description: "20% discount",
    amount: 0.2,
  },
  CODE1: {
    description: "50% discount",
    amount: 0.5,
  },
  CODE2: {
    description: "50% discount",
    amount: 0.5,
  },
};

app.use(express.json());

const toDiscount = (
  discount: (typeof exampleDiscounts)["save20"],
  amount: number,
) => ({
  amount: Math.floor(amount * discount.amount),
  description: discount.description,
  line_id: 1,
});

export const handleDiscountCode = (
  data: DiscountCodesCallback,
): DiscountCodesCallback | { shipping_options: any[] } => {
  const options = (data.express && data.express.shipping_options) || [];
  const noDiscount = () => {
    const discountLessItems = (data.order.items || []).map((i) => {
      const discounts = i.discount_lines || [];
      const discountAmount = discounts.reduce(
        (prev, cur) => prev + cur.amount,
        0,
      );
      return {
        ...i,
        amount: i.amount + discountAmount,
        discount_lines: [],
      };
    });
    const newAmount = discountLessItems.reduce(
      (prev, cur) => prev + cur.amount,
      0,
    );
    return {
      shipping_options: options,
      order: {
        ...data.order,
        items: discountLessItems,
        amount: newAmount || data.order.amount,
        discount_codes: [],
      },
    };
  };

  const codes = (data.order && data.order.discount_codes) || [];

  if (!codes || codes.length === 0) {
    return noDiscount();
  }

  if (codes.every((c) => !exampleDiscounts.hasOwnProperty(c))) {
    return noDiscount();
  }

  const { amount, items } = data.order;
  if (amount <= 0) {
    return noDiscount();
  }

  if (!items || items.length === 0) {
    const discounts = codes.map((d) =>
      toDiscount(exampleDiscounts[d as keyof typeof exampleDiscounts], amount),
    );
    const discountsAmount = discounts.reduce(
      (prev, cur) => prev + cur.amount,
      0,
    );
    return {
      shipping_options: options,
      order: {
        discount_codes: codes,
        amount: amount - discountsAmount,
        discount_lines: discounts,
      },
    };
  }

  // insert items if no items is set
  const itemsWithDiscount = items.map((i) => {
    if (i.amount < 0) {
      return i;
    }
    const discounts = codes.map((d) =>
      toDiscount(
        exampleDiscounts[d as keyof typeof exampleDiscounts],
        i.amount,
      ),
    );
    const discountsAmount = discounts.reduce(
      (prev, cur) => prev + cur.amount,
      0,
    );
    return {
      ...i,
      amount: i.amount - discountsAmount,
      discount_lines: discounts,
    };
  });

  const itemDiscountTotal = itemsWithDiscount.reduce(
    (prev, cur) =>
      prev + (cur.discount_lines?.reduce((p, c) => p + c?.amount, 0) ?? 0),
    0,
  );

  const newAmount = amount - itemDiscountTotal;

  return {
    shipping_options: options,
    order: {
      discount_codes: codes,
      items: itemsWithDiscount,
      amount: newAmount,
    },
  };
};

app.post("/shipping-address-callback", (_, res) => {
  res.status(200).json({
    shipping_options: [
      {
        id: "free-shipping",
        line_id: "free-shipping-line",
        amount: 0,
        title: "Free Shipping",
        operator: "examples",
      },
    ],
  });
});

app.post("/discount-code-callback", (req, res) => {
  res.status(200).json(handleDiscountCode(req.body));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

interface AddressCallbackResponse {
  // response shipping options
  shipping_options: {}[];
  // request shipping options
  express?: {
    shipping_options: {}[];
  };
}

type Discount = { amount: number; description: string; line_id: number };

export interface DiscountCodesCallback extends AddressCallbackResponse {
  order: {
    amount: number;
    discount_codes?: string[];
    items?: {
      line_id: string;
      amount: number;
      discount_lines?: Discount[];
    }[];
    shipping_option?: { amount: number };
    discount_lines?: Discount[];
  };
}
