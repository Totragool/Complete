import React, { useState } from 'react';
import { Form, Rate, Input, Button, Upload, Space, message, Typography, App } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from 'react-query';
import { ReviewService } from '../../services/ReviewService';
import { ReviewInput } from '../../interfaces/Review';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';

const { TextArea } = Input;
const { Text } = Typography;

interface ReviewFormProps {
    productId: number;
    onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const queryClient = useQueryClient();
    const userId = "user123"; // Should come from auth context

    const { mutate: submitReview, isLoading } = useMutation(
        async (values: any) => {
            // First upload images if any
            const imageUrls = await Promise.all(
                fileList.map(async (file) => {
                    if (file.originFileObj) {
                        return await ReviewService.uploadImage(file.originFileObj);
                    }
                    return '';
                })
            );

            // Create review with image URLs
            const reviewData: ReviewInput = {
                productId: productId,  // Changed from product_id to productId
                userId: userId,      // Changed from user_id to userId
                rating: values.rating,
                comment: values.comment,
                images: imageUrls.filter(url => url) // Remove empty strings
            };

            return ReviewService.createReview(reviewData);
        },
        {
            onSuccess: () => {
                // Invalidate queries
                queryClient.invalidateQueries(['reviews', productId]);
                queryClient.invalidateQueries(['reviewAnalytics', productId]);
                
                // Reset form
                form.resetFields();
                setFileList([]);
                
                // Show success message
                message.success('Review submitted successfully!');
                
                // Call success callback
                if (onSuccess) onSuccess();
            },
            onError: (error: Error) => {
                message.error(`Failed to submit review: ${error.message}`);
            }
        }
    );

    const handleSubmit = async (values: any) => {
        try {
            await submitReview(values);
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message);
            } else {
                message.error('Failed to submit review');
            }
        }
    };

    const beforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
            return false;
        }

        return true;
    };

    const handleChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="review-form"
        >
            <Form.Item
                name="rating"
                label="Your Rating"
                rules={[{ required: true, message: 'Please give a rating' }]}
            >
                <Rate allowHalf />
            </Form.Item>

            <Form.Item
                name="comment"
                label="Your Review"
                rules={[
                    { required: true, message: 'Please write your review' },
                    { min: 10, message: 'Review must be at least 10 characters long' }
                ]}
            >
                <TextArea
                    rows={4}
                    placeholder="Share your experience with this product..."
                    maxLength={500}
                    showCount
                />
            </Form.Item>

            <Form.Item 
    label="Add Photos"
    help="You can upload up to 5 images (2MB max each)"
>
    <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        maxCount={5}
        customRequest={async ({ file, onSuccess, onError }) => {
            try {
                const url = await ReviewService.uploadImage(file as File);
                onSuccess?.(url);
            } catch (error) {
                onError?.(new Error('Upload failed'));
                message.error('Failed to upload image');
            }
        }}
    >
        {fileList.length >= 5 ? null : (
            <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        )}
    </Upload>
</Form.Item>

            <Form.Item>
                <Space direction="vertical" size="small" className="w-full">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        icon={<UserOutlined />}
                        block
                    >
                        Submit Review
                    </Button>
                    <Text type="secondary" className="text-sm">
                        By submitting, you agree to our review guidelines
                    </Text>
                </Space>
            </Form.Item>
        </Form>
    );
};