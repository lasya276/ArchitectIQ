/**
 * Document Export Service
 * Handles authenticated document generation and browser downloads for DOCX and PDF.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function triggerDownload(url: string, body: any): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = `Export failed (HTTP ${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch {
      // Keep default error
    }
    throw new Error(errorMsg);
  }

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition') || '';
  let filename = 'ArchitectIQ_Document';
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match && match[1]) {
    filename = match[1].replace(/['"]/g, '').trim();
  } else {
    filename += body.format === 'pdf' ? '.pdf' : '.docx';
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export const exportService = {
  /**
   * Export an Architecture Blueprint version as Word (.docx) or PDF (.pdf)
   */
  async exportBlueprint(
    projectId: string,
    blueprintVersion: number,
    format: 'docx' | 'pdf'
  ): Promise<void> {
    return triggerDownload(`/projects/${projectId}/export/blueprint`, {
      blueprint_version: blueprintVersion,
      format,
    });
  },

  /**
   * Export a Software Design version as Word (.docx) or PDF (.pdf)
   */
  async exportSoftwareDesign(
    projectId: string,
    softwareDesignVersion: number,
    format: 'docx' | 'pdf'
  ): Promise<void> {
    return triggerDownload(`/projects/${projectId}/export/software-design`, {
      software_design_version: softwareDesignVersion,
      format,
    });
  },

  /**
   * Export Complete Architecture Documentation (both Blueprint and Software Design)
   */
  async exportDocumentation(
    projectId: string,
    blueprintVersion: number,
    softwareDesignVersion: number,
    format: 'docx' | 'pdf'
  ): Promise<void> {
    return triggerDownload(`/projects/${projectId}/export/documentation`, {
      blueprint_version: blueprintVersion,
      software_design_version: softwareDesignVersion,
      format,
    });
  },
};

