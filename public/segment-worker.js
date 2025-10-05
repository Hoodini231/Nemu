import { env, SamModel, AutoProcessor, RawImage, Tensor } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

env.allowLocalModels = false;

// Add progress callback
env.backends.onnx.wasm.numThreads = 1;

class SegmentAnythingSingleton {
    static model_id = 'Xenova/slimsam-77-uniform';
    static model;
    static processor;
    static quantized = true;

    static getInstance() {
        if (!this.model) {
            self.postMessage({ 
                type: 'loading_progress', 
                data: { status: 'Downloading model...', progress: 0 } 
            });
            
            this.model = SamModel.from_pretrained(this.model_id, {
                quantized: this.quantized,
                progress_callback: (progress) => {
                    self.postMessage({ 
                        type: 'loading_progress', 
                        data: { 
                            status: 'Downloading model...', 
                            progress: progress.progress || 0,
                            file: progress.file || '',
                            loaded: progress.loaded || 0,
                            total: progress.total || 0
                        } 
                    });
                }
            });
        }
        if (!this.processor) {
            self.postMessage({ 
                type: 'loading_progress', 
                data: { status: 'Loading processor...', progress: 50 } 
            });
            
            this.processor = AutoProcessor.from_pretrained(this.model_id);
        }

        return Promise.all([this.model, this.processor]);
    }
}

let image_embeddings = null;
let image_inputs = null;
let ready = false;

self.onmessage = async (e) => {
    try {
        const [model, processor] = await SegmentAnythingSingleton.getInstance();
        
        if (!ready) {
            ready = true;
            self.postMessage({ type: 'ready' });
        }

        const { type, data } = e.data;
        
        if (type === 'reset') {
            image_inputs = null;
            image_embeddings = null;
        } else if (type === 'segment') {
            self.postMessage({ type: 'segment_result', data: 'start' });
            
            const image = await RawImage.read(data);
            image_inputs = await processor(image);
            
            self.postMessage({ 
                type: 'loading_progress', 
                data: { status: 'Computing embeddings...', progress: 75 } 
            });
            
            image_embeddings = await model.get_image_embeddings(image_inputs);
            
            self.postMessage({ type: 'segment_result', data: 'done' });
        } else if (type === 'decode') {
            const reshaped = image_inputs.reshaped_input_sizes[0];
            const points = data.map(x => [x.point[0] * reshaped[1], x.point[1] * reshaped[0]]);
            const labels = data.map(x => BigInt(x.label));

            const input_points = new Tensor('float32', points.flat(Infinity), [1, 1, points.length, 2]);
            const input_labels = new Tensor('int64', labels.flat(Infinity), [1, 1, labels.length]);

            const outputs = await model({
                ...image_embeddings,
                input_points,
                input_labels,
            });

            const masks = await processor.post_process_masks(
                outputs.pred_masks,
                image_inputs.original_sizes,
                image_inputs.reshaped_input_sizes,
            );

            self.postMessage({
                type: 'decode_result',
                data: {
                    mask: RawImage.fromTensor(masks[0][0]),
                    scores: outputs.iou_scores.data,
                },
            });
        }
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ 
            type: 'error', 
            data: { message: error.message, stack: error.stack } 
        });
    }
};