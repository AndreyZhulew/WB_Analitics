<template>
  <div class="data-table">
    <div class="table-header" v-if="title">
      <h3>{{ title }}</h3>
      <div class="table-controls">
        <el-select
          v-model="localPageSize"
          @change="onPageSizeChange"
          size="small"
          style="width: 120px; margin-right: 10px"
        >
          <el-option
            v-for="size in pageSizes"
            :key="size"
            :label="`${size} записей`"
            :value="size"
          />
        </el-select>
      </div>
    </div>

    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="loading"
      stripe
      border
      :row-class-name="tableRowClassName"
      class="full-width-table"
      :flexible="true"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth || 120"
        :sortable="column.sortable"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span v-if="column.formatter">
            {{ column.formatter(scope.row[column.prop], scope.row) }}
          </span>
          <span v-else>
            {{ scope.row[column.prop] }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="showPagination && total > pageSize">
      <el-pagination
        @current-change="onPageChange"
        :current-page="currentPage"
        :page-size="localPageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        :page-sizes="pageSizes"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 50,
  },
  total: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: "",
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
});

const emit = defineEmits(["page-change", "page-size-change"]);

const localPageSize = ref(props.pageSize);

const onPageChange = (page) => {
  emit("page-change", page);
};

const onPageSizeChange = (size) => {
  localPageSize.value = size;
  emit("page-size-change", size);
};

const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return "even-row";
  }
  return "odd-row";
};

// Синхронизируем локальный pageSize с пропсом
watch(
  () => props.pageSize,
  (newVal) => {
    localPageSize.value = newVal;
  }
);
</script>

<style scoped>
.data-table {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.pagination-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px 20px 20px;
}

:deep(.el-table .even-row) {
  background-color: #fafafa;
}

:deep(.el-table .odd-row) {
  background-color: #ffffff;
}

:deep(.full-width-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table colgroup col) {
  width: auto !important;
}

/* Адаптивность для таблицы */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .pagination-container {
    flex-wrap: wrap;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
