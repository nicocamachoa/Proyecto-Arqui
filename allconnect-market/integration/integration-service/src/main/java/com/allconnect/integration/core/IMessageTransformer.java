package com.allconnect.integration.core;

/**
 * Generic interface for message transformation between internal and external formats.
 * @param <I> Internal format type
 * @param <E> External format type
 */
public interface IMessageTransformer<I, E> {

    /**
     * Transforms internal request to external format
     */
    E transformRequest(I internalRequest);

    /**
     * Transforms external response to internal format
     */
    I transformResponse(E externalResponse);
}
